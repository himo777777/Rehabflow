-- ============================================================================
-- AUDIT LOGS TABLE MIGRATION
-- ============================================================================
-- Comprehensive audit logging for HIPAA/GDPR compliance
-- Tracks all data access, modifications, and security events

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Actor information
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL DEFAULT 'anonymous', -- 'patient', 'provider', 'admin', 'system'
  actor_email TEXT,

  -- Action details
  action TEXT NOT NULL, -- 'READ', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'CONSENT'
  action_category TEXT NOT NULL DEFAULT 'data', -- 'auth', 'data', 'admin', 'system'

  -- Resource information
  resource_type TEXT NOT NULL, -- 'patient_data', 'exercise', 'program', 'assessment', etc.
  resource_id TEXT, -- Can be UUID or composite key
  resource_owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Change tracking (for UPDATE actions)
  changes JSONB DEFAULT '{}'::jsonb, -- { before: {}, after: {}, fields_changed: [] }

  -- Context
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  request_id TEXT, -- For correlating related log entries

  -- Result
  success BOOLEAN NOT NULL DEFAULT true,
  error_code TEXT,
  error_message TEXT,

  -- HIPAA-specific fields
  phi_accessed BOOLEAN DEFAULT false, -- Protected Health Information
  purpose TEXT, -- 'treatment', 'payment', 'operations', 'research', 'legal'

  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Retention
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 years') -- HIPAA requires 6 years, we keep 7
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_owner ON audit_logs(resource_owner_id);

-- Action-based lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_category ON audit_logs(action_category);

-- Security monitoring indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_failed ON audit_logs(success) WHERE success = false;
CREATE INDEX IF NOT EXISTS idx_audit_logs_phi ON audit_logs(phi_accessed) WHERE phi_accessed = true;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_time ON audit_logs(actor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_time ON audit_logs(resource_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_owner_time ON audit_logs(resource_owner_id, timestamp DESC);

-- Session correlation
CREATE INDEX IF NOT EXISTS idx_audit_logs_session ON audit_logs(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_request ON audit_logs(request_id) WHERE request_id IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all audit logs
CREATE POLICY "Admins can read all audit logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Providers can read audit logs for their patients
CREATE POLICY "Providers can read patient audit logs" ON audit_logs
  FOR SELECT
  USING (
    resource_owner_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM provider_patients
      WHERE provider_patients.patient_id = audit_logs.resource_owner_id
      AND provider_patients.provider_id = auth.uid()
      AND provider_patients.revoked_at IS NULL
      AND (provider_patients.expires_at IS NULL OR provider_patients.expires_at > NOW())
    )
  );

-- Users can read their own audit logs (their actions OR resources they own)
CREATE POLICY "Users can read own audit logs" ON audit_logs
  FOR SELECT
  USING (
    actor_id = auth.uid()
    OR resource_owner_id = auth.uid()
  );

-- Only system can insert audit logs (via service role key)
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT
  WITH CHECK (true); -- Controlled at application level

-- No one can update or delete audit logs (immutable)
-- No UPDATE or DELETE policies

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to create an audit log entry (for use from application)
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_resource_owner_id UUID DEFAULT NULL,
  p_changes JSONB DEFAULT '{}'::jsonb,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_phi_accessed BOOLEAN DEFAULT false,
  p_purpose TEXT DEFAULT 'treatment',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_actor_id UUID;
  v_actor_role TEXT;
  v_actor_email TEXT;
BEGIN
  -- Get current user info
  v_actor_id := auth.uid();

  -- Get role from JWT or user metadata
  SELECT
    COALESCE(
      (auth.jwt()->>'role')::text,
      (raw_user_meta_data->>'role')::text,
      'patient'
    ),
    email
  INTO v_actor_role, v_actor_email
  FROM auth.users
  WHERE id = v_actor_id;

  -- Insert audit log
  INSERT INTO audit_logs (
    actor_id,
    actor_role,
    actor_email,
    action,
    action_category,
    resource_type,
    resource_id,
    resource_owner_id,
    changes,
    success,
    error_message,
    phi_accessed,
    purpose,
    metadata
  ) VALUES (
    v_actor_id,
    COALESCE(v_actor_role, 'anonymous'),
    v_actor_email,
    p_action,
    CASE
      WHEN p_action IN ('LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'MFA_ENABLE', 'MFA_DISABLE') THEN 'auth'
      WHEN p_action IN ('ADMIN_ACTION', 'CONFIG_CHANGE', 'ROLE_CHANGE') THEN 'admin'
      WHEN p_action IN ('SYSTEM_ERROR', 'SCHEDULED_TASK', 'CLEANUP') THEN 'system'
      ELSE 'data'
    END,
    p_resource_type,
    p_resource_id,
    p_resource_owner_id,
    p_changes,
    p_success,
    p_error_message,
    p_phi_accessed,
    p_purpose,
    p_metadata
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit trail for a specific resource
CREATE OR REPLACE FUNCTION get_resource_audit_trail(
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  timestamp TIMESTAMPTZ,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT,
  changes JSONB,
  success BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    audit_logs.id,
    audit_logs.timestamp,
    audit_logs.actor_email,
    audit_logs.actor_role,
    audit_logs.action,
    audit_logs.changes,
    audit_logs.success
  FROM audit_logs
  WHERE audit_logs.resource_type = p_resource_type
    AND audit_logs.resource_id = p_resource_id
  ORDER BY audit_logs.timestamp DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  action TEXT,
  count BIGINT,
  last_occurrence TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    audit_logs.action,
    COUNT(*)::BIGINT as count,
    MAX(audit_logs.timestamp) as last_occurrence
  FROM audit_logs
  WHERE (audit_logs.actor_id = p_user_id OR audit_logs.resource_owner_id = p_user_id)
    AND audit_logs.timestamp >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY audit_logs.action
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
  p_window_minutes INTEGER DEFAULT 5,
  p_threshold INTEGER DEFAULT 100
)
RETURNS TABLE (
  actor_id UUID,
  actor_email TEXT,
  action_count BIGINT,
  failed_count BIGINT,
  unique_resources BIGINT,
  window_start TIMESTAMPTZ,
  window_end TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.actor_id,
    al.actor_email,
    COUNT(*)::BIGINT as action_count,
    COUNT(*) FILTER (WHERE al.success = false)::BIGINT as failed_count,
    COUNT(DISTINCT al.resource_id)::BIGINT as unique_resources,
    MIN(al.timestamp) as window_start,
    MAX(al.timestamp) as window_end
  FROM audit_logs al
  WHERE al.timestamp >= NOW() - (p_window_minutes || ' minutes')::INTERVAL
    AND al.actor_id IS NOT NULL
  GROUP BY al.actor_id, al.actor_email
  HAVING COUNT(*) >= p_threshold
     OR COUNT(*) FILTER (WHERE al.success = false) >= 10
  ORDER BY action_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_resource_audit_trail TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_activity_summary TO authenticated;
GRANT EXECUTE ON FUNCTION detect_suspicious_activity TO authenticated;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE audit_logs IS 'Immutable audit trail for HIPAA/GDPR compliance. Tracks all data access, modifications, and security events.';
COMMENT ON COLUMN audit_logs.phi_accessed IS 'Indicates if Protected Health Information was accessed (HIPAA requirement)';
COMMENT ON COLUMN audit_logs.purpose IS 'Purpose of data access for HIPAA compliance: treatment, payment, operations, research, legal';
COMMENT ON COLUMN audit_logs.expires_at IS 'Retention policy: HIPAA requires 6 years minimum, we retain for 7 years';
COMMENT ON FUNCTION log_audit_event IS 'Creates an audit log entry. Use from application for all data access events.';
COMMENT ON FUNCTION detect_suspicious_activity IS 'Security monitoring: detects unusual access patterns that may indicate compromise';
