-- ============================================================================
-- PROVIDER-PATIENT AUTHORIZATION MIGRATION
-- ============================================================================
-- Implements secure provider-patient relationships for healthcare settings
-- Critical for HIPAA compliance - controls who can access patient data

-- ============================================================================
-- CLINICS TABLE (Optional organization level)
-- ============================================================================

CREATE TABLE IF NOT EXISTS clinics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organization_number TEXT UNIQUE, -- Swedish: organisationsnummer
  address JSONB DEFAULT '{}'::jsonb,
  phone TEXT,
  email TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_clinics_name ON clinics(name);
CREATE INDEX IF NOT EXISTS idx_clinics_active ON clinics(active);

-- ============================================================================
-- PROVIDER-PATIENT RELATIONSHIPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS provider_patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Relationship parties
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,

  -- Relationship type and scope
  relationship_type TEXT NOT NULL DEFAULT 'treating',
  -- 'treating' - Primary care provider
  -- 'consulting' - Temporary consultation
  -- 'covering' - Covering for another provider
  -- 'supervising' - Supervision relationship (student/mentor)

  -- Access level
  access_level TEXT NOT NULL DEFAULT 'full',
  -- 'full' - Full read/write access
  -- 'read_only' - View only
  -- 'limited' - Specific data types only

  -- Access scope (for 'limited' access_level)
  access_scope JSONB DEFAULT NULL,
  -- Example: { "tables": ["exercise_logs", "progress"], "exclude_tables": ["clinical_notes"] }

  -- Audit trail
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Time-limited access
  expires_at TIMESTAMPTZ DEFAULT NULL, -- NULL = no expiry
  revoked_at TIMESTAMPTZ DEFAULT NULL,
  revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revocation_reason TEXT,

  -- Consent tracking
  patient_consent_given BOOLEAN DEFAULT false,
  patient_consent_at TIMESTAMPTZ,
  consent_method TEXT, -- 'in_app', 'verbal', 'written', 'implied'

  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT unique_provider_patient UNIQUE (provider_id, patient_id),
  CONSTRAINT different_users CHECK (provider_id != patient_id),
  CONSTRAINT valid_relationship_type CHECK (
    relationship_type IN ('treating', 'consulting', 'covering', 'supervising')
  ),
  CONSTRAINT valid_access_level CHECK (
    access_level IN ('full', 'read_only', 'limited')
  )
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_pp_provider_id ON provider_patients(provider_id);
CREATE INDEX IF NOT EXISTS idx_pp_patient_id ON provider_patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_pp_clinic_id ON provider_patients(clinic_id) WHERE clinic_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pp_relationship_type ON provider_patients(relationship_type);
CREATE INDEX IF NOT EXISTS idx_pp_active ON provider_patients(provider_id, patient_id)
  WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW());
CREATE INDEX IF NOT EXISTS idx_pp_granted_at ON provider_patients(granted_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE provider_patients ENABLE ROW LEVEL SECURITY;

-- Providers can view their own patient relationships
CREATE POLICY "Providers can view their patients" ON provider_patients
  FOR SELECT
  USING (provider_id = auth.uid());

-- Patients can view their provider relationships
CREATE POLICY "Patients can view their providers" ON provider_patients
  FOR SELECT
  USING (patient_id = auth.uid());

-- Admins can view all relationships
CREATE POLICY "Admins can view all relationships" ON provider_patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Providers can create relationships (with patient consent)
CREATE POLICY "Providers can create relationships" ON provider_patients
  FOR INSERT
  WITH CHECK (
    provider_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text IN ('provider', 'admin')
    )
  );

-- Patients can consent to relationships
CREATE POLICY "Patients can update consent" ON provider_patients
  FOR UPDATE
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Providers and patients can revoke relationships
CREATE POLICY "Either party can revoke" ON provider_patients
  FOR UPDATE
  USING (provider_id = auth.uid() OR patient_id = auth.uid())
  WITH CHECK (
    (provider_id = auth.uid() OR patient_id = auth.uid())
    AND revoked_at IS NOT NULL -- Can only update to revoke
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if provider has access to patient
CREATE OR REPLACE FUNCTION has_patient_access(
  p_provider_id UUID,
  p_patient_id UUID,
  p_required_level TEXT DEFAULT 'read_only'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_access_level TEXT;
BEGIN
  SELECT access_level INTO v_access_level
  FROM provider_patients
  WHERE provider_id = p_provider_id
    AND patient_id = p_patient_id
    AND revoked_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW())
    AND patient_consent_given = true;

  IF v_access_level IS NULL THEN
    RETURN false;
  END IF;

  -- Check access level hierarchy
  IF p_required_level = 'read_only' THEN
    RETURN v_access_level IN ('full', 'read_only', 'limited');
  ELSIF p_required_level = 'limited' THEN
    RETURN v_access_level IN ('full', 'limited');
  ELSIF p_required_level = 'full' THEN
    RETURN v_access_level = 'full';
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all patients for a provider
CREATE OR REPLACE FUNCTION get_provider_patients(
  p_provider_id UUID
)
RETURNS TABLE (
  patient_id UUID,
  patient_email TEXT,
  relationship_type TEXT,
  access_level TEXT,
  granted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.patient_id,
    u.email as patient_email,
    pp.relationship_type,
    pp.access_level,
    pp.granted_at,
    pp.expires_at
  FROM provider_patients pp
  JOIN auth.users u ON u.id = pp.patient_id
  WHERE pp.provider_id = p_provider_id
    AND pp.revoked_at IS NULL
    AND (pp.expires_at IS NULL OR pp.expires_at > NOW())
    AND pp.patient_consent_given = true
  ORDER BY pp.granted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all providers for a patient
CREATE OR REPLACE FUNCTION get_patient_providers(
  p_patient_id UUID
)
RETURNS TABLE (
  provider_id UUID,
  provider_email TEXT,
  relationship_type TEXT,
  access_level TEXT,
  clinic_name TEXT,
  granted_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.provider_id,
    u.email as provider_email,
    pp.relationship_type,
    pp.access_level,
    c.name as clinic_name,
    pp.granted_at
  FROM provider_patients pp
  JOIN auth.users u ON u.id = pp.provider_id
  LEFT JOIN clinics c ON c.id = pp.clinic_id
  WHERE pp.patient_id = p_patient_id
    AND pp.revoked_at IS NULL
    AND (pp.expires_at IS NULL OR pp.expires_at > NOW())
  ORDER BY pp.granted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant provider access to patient
CREATE OR REPLACE FUNCTION grant_patient_access(
  p_provider_id UUID,
  p_patient_id UUID,
  p_relationship_type TEXT DEFAULT 'treating',
  p_access_level TEXT DEFAULT 'full',
  p_clinic_id UUID DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_relationship_id UUID;
BEGIN
  INSERT INTO provider_patients (
    provider_id,
    patient_id,
    clinic_id,
    relationship_type,
    access_level,
    granted_by,
    expires_at,
    notes,
    patient_consent_given,
    patient_consent_at,
    consent_method
  ) VALUES (
    p_provider_id,
    p_patient_id,
    p_clinic_id,
    p_relationship_type,
    p_access_level,
    auth.uid(),
    p_expires_at,
    p_notes,
    -- If patient is granting, consent is immediate
    CASE WHEN auth.uid() = p_patient_id THEN true ELSE false END,
    CASE WHEN auth.uid() = p_patient_id THEN NOW() ELSE NULL END,
    CASE WHEN auth.uid() = p_patient_id THEN 'in_app' ELSE NULL END
  )
  ON CONFLICT (provider_id, patient_id) DO UPDATE SET
    relationship_type = EXCLUDED.relationship_type,
    access_level = EXCLUDED.access_level,
    clinic_id = EXCLUDED.clinic_id,
    expires_at = EXCLUDED.expires_at,
    notes = EXCLUDED.notes,
    revoked_at = NULL, -- Re-enable if previously revoked
    revoked_by = NULL,
    revocation_reason = NULL
  RETURNING id INTO v_relationship_id;

  RETURN v_relationship_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Patient gives consent
CREATE OR REPLACE FUNCTION consent_to_provider(
  p_provider_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE provider_patients
  SET
    patient_consent_given = true,
    patient_consent_at = NOW(),
    consent_method = 'in_app'
  WHERE provider_id = p_provider_id
    AND patient_id = auth.uid()
    AND revoked_at IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke provider access
CREATE OR REPLACE FUNCTION revoke_patient_access(
  p_provider_id UUID,
  p_patient_id UUID,
  p_reason TEXT DEFAULT 'Relationship ended'
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE provider_patients
  SET
    revoked_at = NOW(),
    revoked_by = auth.uid(),
    revocation_reason = p_reason
  WHERE provider_id = p_provider_id
    AND patient_id = p_patient_id
    AND revoked_at IS NULL
    AND (auth.uid() = p_provider_id OR auth.uid() = p_patient_id);

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- APPLY RLS TO PATIENT DATA TABLES
-- ============================================================================

-- Helper function for RLS policies
CREATE OR REPLACE FUNCTION user_can_access_patient_data(p_patient_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- User can always access their own data
  IF auth.uid() = p_patient_id THEN
    RETURN true;
  END IF;

  -- Check if user is an authorized provider
  RETURN EXISTS (
    SELECT 1 FROM provider_patients
    WHERE provider_id = auth.uid()
      AND patient_id = p_patient_id
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
      AND patient_consent_given = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: Apply to progress table (repeat for other tables)
-- DROP POLICY IF EXISTS "Providers can view patient progress" ON progress;
-- CREATE POLICY "Providers can view patient progress" ON progress
--   FOR SELECT
--   USING (user_can_access_patient_data(user_id));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON provider_patients TO authenticated;
GRANT INSERT, UPDATE ON provider_patients TO authenticated;
GRANT SELECT ON clinics TO authenticated;

GRANT EXECUTE ON FUNCTION has_patient_access TO authenticated;
GRANT EXECUTE ON FUNCTION get_provider_patients TO authenticated;
GRANT EXECUTE ON FUNCTION get_patient_providers TO authenticated;
GRANT EXECUTE ON FUNCTION grant_patient_access TO authenticated;
GRANT EXECUTE ON FUNCTION consent_to_provider TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_patient_access TO authenticated;
GRANT EXECUTE ON FUNCTION user_can_access_patient_data TO authenticated;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE clinics IS 'Healthcare organizations that providers belong to';
COMMENT ON TABLE provider_patients IS 'Authorization relationships between healthcare providers and patients. Core to HIPAA access control.';
COMMENT ON COLUMN provider_patients.relationship_type IS 'Type of clinical relationship: treating (primary), consulting (temporary), covering (substitute), supervising (student/mentor)';
COMMENT ON COLUMN provider_patients.access_level IS 'Data access level: full (read/write), read_only (view), limited (specific tables only)';
COMMENT ON COLUMN provider_patients.patient_consent_given IS 'GDPR/HIPAA requirement: Patient must consent to data sharing';
COMMENT ON FUNCTION has_patient_access IS 'Check if a provider has valid, consented access to a patient';
COMMENT ON FUNCTION user_can_access_patient_data IS 'RLS helper: Returns true if current user can access the specified patient data';
