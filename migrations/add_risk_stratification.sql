-- ============================================================================
-- RISK STRATIFICATION TABLES MIGRATION
-- ============================================================================
-- Patient risk scoring system for identifying high-risk patients requiring
-- intensive monitoring based on pain, adherence, psychological, and movement factors

-- ============================================================================
-- RISK ASSESSMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES auth.users(id),

  -- Overall risk score (0-100)
  overall_score NUMERIC(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),

  -- Individual factor scores (0-100 each)
  pain_score NUMERIC(5,2) CHECK (pain_score >= 0 AND pain_score <= 100),
  adherence_score NUMERIC(5,2) CHECK (adherence_score >= 0 AND adherence_score <= 100),
  psychological_score NUMERIC(5,2) CHECK (psychological_score >= 0 AND psychological_score <= 100),
  movement_score NUMERIC(5,2) CHECK (movement_score >= 0 AND movement_score <= 100),
  health_score NUMERIC(5,2) CHECK (health_score >= 0 AND health_score <= 100),
  progression_score NUMERIC(5,2) CHECK (progression_score >= 0 AND progression_score <= 100),

  -- Detailed contributing factors
  contributing_factors JSONB DEFAULT '[]'::jsonb,
  -- Format: [{ "factor": "pain_trend_worsening", "impact": 0.8, "description": "Smärta ökande senaste 7 dagarna" }]

  -- AI-generated recommendations
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  -- Format: [{ "priority": "high", "action": "Kontakta patienten", "reason": "Kritisk smärtnivå" }]

  -- Trend tracking
  previous_score NUMERIC(5,2),
  score_trend TEXT CHECK (score_trend IN ('improving', 'stable', 'worsening')),
  score_change NUMERIC(5,2),

  -- Data sources used for this assessment
  data_sources JSONB DEFAULT '{}'::jsonb,
  -- Format: { "pain_logs": 14, "movement_sessions": 10, "promis_assessment": true, "health_data": true }

  -- Review tracking
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_risk_assessments_user_id ON risk_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_provider_id ON risk_assessments(provider_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_level ON risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_created_at ON risk_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_user_date ON risk_assessments(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own risk assessments"
  ON risk_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can view patient risk assessments"
  ON risk_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provider_patients
      WHERE provider_patients.patient_id = risk_assessments.user_id
      AND provider_patients.provider_id = auth.uid()
    )
  );

CREATE POLICY "Providers can insert patient risk assessments"
  ON risk_assessments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM provider_patients
      WHERE provider_patients.patient_id = risk_assessments.user_id
      AND provider_patients.provider_id = auth.uid()
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Providers can update patient risk assessments"
  ON risk_assessments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM provider_patients
      WHERE provider_patients.patient_id = risk_assessments.user_id
      AND provider_patients.provider_id = auth.uid()
    )
  );

-- ============================================================================
-- RISK ALERTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS risk_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES risk_assessments(id) ON DELETE CASCADE,

  -- Alert details
  alert_type TEXT NOT NULL CHECK (alert_type IN ('risk_increase', 'critical_level', 'no_activity', 'pain_spike', 'adherence_drop')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Trigger conditions
  trigger_data JSONB DEFAULT '{}'::jsonb,
  -- Format: { "previous_level": "moderate", "current_level": "critical", "change": 25 }

  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_risk_alerts_user_id ON risk_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_status ON risk_alerts(status);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_severity ON risk_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_created_at ON risk_alerts(created_at DESC);

-- Enable RLS
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for risk_alerts
CREATE POLICY "Users can view their own risk alerts"
  ON risk_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can view patient risk alerts"
  ON risk_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provider_patients
      WHERE provider_patients.patient_id = risk_alerts.user_id
      AND provider_patients.provider_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update patient risk alerts"
  ON risk_alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM provider_patients
      WHERE provider_patients.patient_id = risk_alerts.user_id
      AND provider_patients.provider_id = auth.uid()
    )
  );

-- ============================================================================
-- RISK CONFIGURATION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS risk_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES auth.users(id),

  -- Thresholds for risk levels
  critical_threshold NUMERIC(5,2) DEFAULT 75,
  high_threshold NUMERIC(5,2) DEFAULT 50,
  moderate_threshold NUMERIC(5,2) DEFAULT 25,

  -- Factor weights (must sum to 1.0)
  pain_weight NUMERIC(3,2) DEFAULT 0.25,
  adherence_weight NUMERIC(3,2) DEFAULT 0.20,
  psychological_weight NUMERIC(3,2) DEFAULT 0.20,
  movement_weight NUMERIC(3,2) DEFAULT 0.15,
  health_weight NUMERIC(3,2) DEFAULT 0.10,
  progression_weight NUMERIC(3,2) DEFAULT 0.10,

  -- Alert settings
  enable_alerts BOOLEAN DEFAULT TRUE,
  alert_on_critical BOOLEAN DEFAULT TRUE,
  alert_on_increase BOOLEAN DEFAULT TRUE,
  alert_cooldown_hours INTEGER DEFAULT 24,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT weights_sum_check CHECK (
    ABS(pain_weight + adherence_weight + psychological_weight + movement_weight + health_weight + progression_weight - 1.0) < 0.01
  )
);

-- Enable RLS
ALTER TABLE risk_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage their risk config"
  ON risk_config FOR ALL
  USING (auth.uid() = provider_id OR provider_id IS NULL);

-- Insert default config
INSERT INTO risk_config (id, provider_id) VALUES (gen_random_uuid(), NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate risk level from score
CREATE OR REPLACE FUNCTION get_risk_level(score NUMERIC)
RETURNS TEXT AS $$
BEGIN
  IF score >= 75 THEN RETURN 'critical';
  ELSIF score >= 50 THEN RETURN 'high';
  ELSIF score >= 25 THEN RETURN 'moderate';
  ELSE RETURN 'low';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get latest risk assessment for a patient
CREATE OR REPLACE FUNCTION get_latest_risk_assessment(p_user_id UUID)
RETURNS risk_assessments AS $$
DECLARE
  v_assessment risk_assessments;
BEGIN
  SELECT * INTO v_assessment
  FROM risk_assessments
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN v_assessment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get risk trend over time
CREATE OR REPLACE FUNCTION get_risk_trend(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  assessment_date DATE,
  overall_score NUMERIC,
  risk_level TEXT,
  pain_score NUMERIC,
  adherence_score NUMERIC,
  psychological_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(ra.created_at) as assessment_date,
    ra.overall_score,
    ra.risk_level,
    ra.pain_score,
    ra.adherence_score,
    ra.psychological_score
  FROM risk_assessments ra
  WHERE ra.user_id = p_user_id
    AND ra.created_at >= NOW() - (p_days || ' days')::INTERVAL
  ORDER BY ra.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get provider's patient risk summary
CREATE OR REPLACE FUNCTION get_provider_risk_summary(p_provider_id UUID)
RETURNS TABLE(
  total_patients INTEGER,
  critical_count INTEGER,
  high_count INTEGER,
  moderate_count INTEGER,
  low_count INTEGER,
  unassessed_count INTEGER,
  avg_risk_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH patient_risks AS (
    SELECT DISTINCT ON (pp.patient_id)
      pp.patient_id,
      ra.risk_level,
      ra.overall_score
    FROM provider_patients pp
    LEFT JOIN risk_assessments ra ON ra.user_id = pp.patient_id
    WHERE pp.provider_id = p_provider_id
      AND pp.status = 'active'
    ORDER BY pp.patient_id, ra.created_at DESC
  )
  SELECT
    COUNT(*)::INTEGER as total_patients,
    COUNT(CASE WHEN risk_level = 'critical' THEN 1 END)::INTEGER as critical_count,
    COUNT(CASE WHEN risk_level = 'high' THEN 1 END)::INTEGER as high_count,
    COUNT(CASE WHEN risk_level = 'moderate' THEN 1 END)::INTEGER as moderate_count,
    COUNT(CASE WHEN risk_level = 'low' THEN 1 END)::INTEGER as low_count,
    COUNT(CASE WHEN risk_level IS NULL THEN 1 END)::INTEGER as unassessed_count,
    ROUND(AVG(overall_score), 1) as avg_risk_score
  FROM patient_risks;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_risk_level TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_risk_assessment TO authenticated;
GRANT EXECUTE ON FUNCTION get_risk_trend TO authenticated;
GRANT EXECUTE ON FUNCTION get_provider_risk_summary TO authenticated;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for provider's patients with risk levels
CREATE OR REPLACE VIEW provider_patient_risks AS
SELECT DISTINCT ON (pp.patient_id)
  pp.provider_id,
  pp.patient_id,
  pp.status as patient_status,
  ra.id as assessment_id,
  ra.overall_score,
  ra.risk_level,
  ra.pain_score,
  ra.adherence_score,
  ra.psychological_score,
  ra.movement_score,
  ra.health_score,
  ra.progression_score,
  ra.score_trend,
  ra.contributing_factors,
  ra.recommended_actions,
  ra.created_at as assessment_date,
  ra.reviewed_at
FROM provider_patients pp
LEFT JOIN risk_assessments ra ON ra.user_id = pp.patient_id
WHERE pp.status = 'active'
ORDER BY pp.patient_id, ra.created_at DESC;

-- Grant access to view
GRANT SELECT ON provider_patient_risks TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_risk_assessment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_risk_assessments_timestamp
  BEFORE UPDATE ON risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_risk_assessment_timestamp();

-- Auto-create alert on critical risk
CREATE OR REPLACE FUNCTION create_risk_alert_on_critical()
RETURNS TRIGGER AS $$
BEGIN
  -- Create alert if risk is critical
  IF NEW.risk_level = 'critical' THEN
    INSERT INTO risk_alerts (
      user_id,
      assessment_id,
      alert_type,
      severity,
      title,
      message,
      trigger_data
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'critical_level',
      'critical',
      'Kritisk risknivå upptäckt',
      'Patienten har uppnått kritisk risknivå (' || ROUND(NEW.overall_score) || '/100). Omedelbar uppföljning rekommenderas.',
      jsonb_build_object(
        'risk_score', NEW.overall_score,
        'risk_level', NEW.risk_level,
        'pain_score', NEW.pain_score,
        'adherence_score', NEW.adherence_score
      )
    );
  END IF;

  -- Create alert if risk increased significantly
  IF NEW.previous_score IS NOT NULL AND NEW.score_change >= 15 THEN
    INSERT INTO risk_alerts (
      user_id,
      assessment_id,
      alert_type,
      severity,
      title,
      message,
      trigger_data
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'risk_increase',
      CASE WHEN NEW.risk_level IN ('critical', 'high') THEN 'critical' ELSE 'warning' END,
      'Betydande ökning av risknivå',
      'Patientens risknivå har ökat med ' || ROUND(NEW.score_change) || ' poäng till ' || NEW.risk_level || ' nivå.',
      jsonb_build_object(
        'previous_score', NEW.previous_score,
        'current_score', NEW.overall_score,
        'change', NEW.score_change
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_risk_alert_trigger
  AFTER INSERT ON risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION create_risk_alert_on_critical();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE risk_assessments IS 'Multi-factor patient risk assessments for identifying high-risk patients requiring intensive monitoring';
COMMENT ON TABLE risk_alerts IS 'Alerts generated when patient risk levels reach concerning thresholds';
COMMENT ON TABLE risk_config IS 'Provider-specific risk calculation configuration and thresholds';
COMMENT ON FUNCTION get_risk_level IS 'Returns risk level text (low/moderate/high/critical) from numeric score';
COMMENT ON FUNCTION get_latest_risk_assessment IS 'Returns the most recent risk assessment for a patient';
COMMENT ON FUNCTION get_risk_trend IS 'Returns risk score history over specified number of days';
COMMENT ON FUNCTION get_provider_risk_summary IS 'Returns aggregate risk statistics for all of a providers patients';
COMMENT ON VIEW provider_patient_risks IS 'Latest risk assessment for each patient assigned to a provider';
