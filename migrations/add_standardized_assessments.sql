-- ============================================================================
-- STANDARDIZED ASSESSMENTS MIGRATION
-- ============================================================================
-- Stores PROMIS-29 and PSFS assessment data for comprehensive outcome tracking

-- ============================================================================
-- PROMIS-29 ASSESSMENTS
-- ============================================================================

-- Create promis29_assessments table
CREATE TABLE IF NOT EXISTS promis29_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Domain T-Scores (standardized to mean 50, SD 10)
  physical_function_tscore NUMERIC CHECK (physical_function_tscore >= 20 AND physical_function_tscore <= 80),
  anxiety_tscore NUMERIC CHECK (anxiety_tscore >= 20 AND anxiety_tscore <= 80),
  depression_tscore NUMERIC CHECK (depression_tscore >= 20 AND depression_tscore <= 80),
  fatigue_tscore NUMERIC CHECK (fatigue_tscore >= 20 AND fatigue_tscore <= 80),
  sleep_disturbance_tscore NUMERIC CHECK (sleep_disturbance_tscore >= 20 AND sleep_disturbance_tscore <= 80),
  social_roles_tscore NUMERIC CHECK (social_roles_tscore >= 20 AND social_roles_tscore <= 80),
  pain_interference_tscore NUMERIC CHECK (pain_interference_tscore >= 20 AND pain_interference_tscore <= 80),

  -- Pain Intensity (0-10 scale, single item)
  pain_intensity NUMERIC CHECK (pain_intensity >= 0 AND pain_intensity <= 10),

  -- Raw scores for each domain (sum of item responses)
  physical_function_raw INTEGER,
  anxiety_raw INTEGER,
  depression_raw INTEGER,
  fatigue_raw INTEGER,
  sleep_disturbance_raw INTEGER,
  social_roles_raw INTEGER,
  pain_interference_raw INTEGER,

  -- Individual item responses (JSON for flexibility)
  responses JSONB NOT NULL,

  -- Severity interpretations
  physical_function_severity TEXT CHECK (physical_function_severity IN ('none', 'mild', 'moderate', 'severe')),
  anxiety_severity TEXT CHECK (anxiety_severity IN ('none', 'mild', 'moderate', 'severe')),
  depression_severity TEXT CHECK (depression_severity IN ('none', 'mild', 'moderate', 'severe')),
  fatigue_severity TEXT CHECK (fatigue_severity IN ('none', 'mild', 'moderate', 'severe')),
  sleep_disturbance_severity TEXT CHECK (sleep_disturbance_severity IN ('none', 'mild', 'moderate', 'severe')),
  social_roles_severity TEXT CHECK (social_roles_severity IN ('none', 'mild', 'moderate', 'severe')),
  pain_interference_severity TEXT CHECK (pain_interference_severity IN ('none', 'mild', 'moderate', 'severe')),

  -- Assessment context
  assessment_type TEXT DEFAULT 'routine' CHECK (assessment_type IN ('initial', 'routine', 'discharge', 'follow_up')),
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for PROMIS-29
CREATE INDEX IF NOT EXISTS idx_promis29_user_id ON promis29_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_promis29_date ON promis29_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_promis29_user_date ON promis29_assessments(user_id, assessment_date DESC);

-- Enable RLS
ALTER TABLE promis29_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for PROMIS-29
CREATE POLICY "Users can view their own PROMIS-29 assessments"
  ON promis29_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PROMIS-29 assessments"
  ON promis29_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PROMIS-29 assessments"
  ON promis29_assessments FOR UPDATE
  USING (auth.uid() = user_id);

-- Providers can view patient PROMIS-29 assessments
CREATE POLICY "Providers can view patient PROMIS-29 assessments"
  ON promis29_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provider_patients
      WHERE provider_patients.patient_id = promis29_assessments.user_id
      AND provider_patients.provider_id = auth.uid()
    )
  );

-- ============================================================================
-- PSFS (Patient-Specific Functional Scale) ASSESSMENTS
-- ============================================================================

-- Create psfs_assessments table
CREATE TABLE IF NOT EXISTS psfs_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Assessment context
  assessment_type TEXT DEFAULT 'routine' CHECK (assessment_type IN ('initial', 'routine', 'discharge', 'follow_up')),

  -- Overall scores
  average_score NUMERIC CHECK (average_score >= 0 AND average_score <= 10),
  total_activities INTEGER CHECK (total_activities >= 1 AND total_activities <= 5),

  -- MCID tracking (Minimal Clinically Important Difference)
  mcid_achieved BOOLEAN DEFAULT FALSE,
  change_from_baseline NUMERIC,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create psfs_activities table (individual activities for each assessment)
CREATE TABLE IF NOT EXISTS psfs_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES psfs_assessments(id) ON DELETE CASCADE,

  -- Activity details
  activity_name TEXT NOT NULL,
  activity_description TEXT,
  is_custom BOOLEAN DEFAULT FALSE,

  -- Score (0-10 scale)
  current_score NUMERIC NOT NULL CHECK (current_score >= 0 AND current_score <= 10),
  baseline_score NUMERIC CHECK (baseline_score >= 0 AND baseline_score <= 10),
  target_score NUMERIC CHECK (target_score >= 0 AND target_score <= 10),

  -- Change tracking
  change_from_baseline NUMERIC,
  mcid_achieved BOOLEAN DEFAULT FALSE,

  -- Order in assessment
  display_order INTEGER NOT NULL DEFAULT 1,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for PSFS
CREATE INDEX IF NOT EXISTS idx_psfs_user_id ON psfs_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_psfs_date ON psfs_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_psfs_user_date ON psfs_assessments(user_id, assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_psfs_activities_assessment ON psfs_activities(assessment_id);

-- Enable RLS
ALTER TABLE psfs_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE psfs_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for PSFS assessments
CREATE POLICY "Users can view their own PSFS assessments"
  ON psfs_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PSFS assessments"
  ON psfs_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PSFS assessments"
  ON psfs_assessments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can view patient PSFS assessments"
  ON psfs_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provider_patients
      WHERE provider_patients.patient_id = psfs_assessments.user_id
      AND provider_patients.provider_id = auth.uid()
    )
  );

-- RLS Policies for PSFS activities
CREATE POLICY "Users can view their PSFS activities"
  ON psfs_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM psfs_assessments
      WHERE psfs_assessments.id = psfs_activities.assessment_id
      AND psfs_assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their PSFS activities"
  ON psfs_activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM psfs_assessments
      WHERE psfs_assessments.id = psfs_activities.assessment_id
      AND psfs_assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can view patient PSFS activities"
  ON psfs_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM psfs_assessments
      JOIN provider_patients ON provider_patients.patient_id = psfs_assessments.user_id
      WHERE psfs_assessments.id = psfs_activities.assessment_id
      AND provider_patients.provider_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate PROMIS-29 change from baseline
CREATE OR REPLACE FUNCTION calculate_promis29_change(
  p_user_id UUID,
  p_assessment_id UUID
)
RETURNS TABLE(
  domain TEXT,
  baseline_tscore NUMERIC,
  current_tscore NUMERIC,
  change NUMERIC,
  mcid_achieved BOOLEAN
) AS $$
DECLARE
  v_baseline RECORD;
  v_current RECORD;
  v_mcid NUMERIC := 3.0; -- PROMIS MCID is typically 3-5 T-score points
BEGIN
  -- Get baseline (first assessment)
  SELECT * INTO v_baseline
  FROM promis29_assessments
  WHERE user_id = p_user_id
  ORDER BY assessment_date ASC
  LIMIT 1;

  -- Get current assessment
  SELECT * INTO v_current
  FROM promis29_assessments
  WHERE id = p_assessment_id;

  IF v_baseline.id IS NULL OR v_current.id IS NULL THEN
    RETURN;
  END IF;

  -- Return changes for each domain
  RETURN QUERY
  SELECT 'Physical Function'::TEXT,
         v_baseline.physical_function_tscore,
         v_current.physical_function_tscore,
         v_current.physical_function_tscore - v_baseline.physical_function_tscore,
         ABS(v_current.physical_function_tscore - v_baseline.physical_function_tscore) >= v_mcid;

  RETURN QUERY
  SELECT 'Anxiety'::TEXT,
         v_baseline.anxiety_tscore,
         v_current.anxiety_tscore,
         v_current.anxiety_tscore - v_baseline.anxiety_tscore,
         ABS(v_current.anxiety_tscore - v_baseline.anxiety_tscore) >= v_mcid;

  RETURN QUERY
  SELECT 'Depression'::TEXT,
         v_baseline.depression_tscore,
         v_current.depression_tscore,
         v_current.depression_tscore - v_baseline.depression_tscore,
         ABS(v_current.depression_tscore - v_baseline.depression_tscore) >= v_mcid;

  RETURN QUERY
  SELECT 'Fatigue'::TEXT,
         v_baseline.fatigue_tscore,
         v_current.fatigue_tscore,
         v_current.fatigue_tscore - v_baseline.fatigue_tscore,
         ABS(v_current.fatigue_tscore - v_baseline.fatigue_tscore) >= v_mcid;

  RETURN QUERY
  SELECT 'Sleep Disturbance'::TEXT,
         v_baseline.sleep_disturbance_tscore,
         v_current.sleep_disturbance_tscore,
         v_current.sleep_disturbance_tscore - v_baseline.sleep_disturbance_tscore,
         ABS(v_current.sleep_disturbance_tscore - v_baseline.sleep_disturbance_tscore) >= v_mcid;

  RETURN QUERY
  SELECT 'Social Roles'::TEXT,
         v_baseline.social_roles_tscore,
         v_current.social_roles_tscore,
         v_current.social_roles_tscore - v_baseline.social_roles_tscore,
         ABS(v_current.social_roles_tscore - v_baseline.social_roles_tscore) >= v_mcid;

  RETURN QUERY
  SELECT 'Pain Interference'::TEXT,
         v_baseline.pain_interference_tscore,
         v_current.pain_interference_tscore,
         v_current.pain_interference_tscore - v_baseline.pain_interference_tscore,
         ABS(v_current.pain_interference_tscore - v_baseline.pain_interference_tscore) >= v_mcid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate PSFS average and MCID
CREATE OR REPLACE FUNCTION calculate_psfs_metrics(
  p_assessment_id UUID
)
RETURNS TABLE(
  average_score NUMERIC,
  change_from_baseline NUMERIC,
  mcid_achieved BOOLEAN,
  activities_improved INTEGER,
  activities_total INTEGER
) AS $$
DECLARE
  v_assessment RECORD;
  v_baseline RECORD;
  v_avg NUMERIC;
  v_baseline_avg NUMERIC;
  v_mcid NUMERIC := 2.0; -- PSFS MCID is typically 2 points
  v_improved INTEGER;
  v_total INTEGER;
BEGIN
  -- Get current assessment
  SELECT * INTO v_assessment
  FROM psfs_assessments
  WHERE id = p_assessment_id;

  -- Calculate current average
  SELECT AVG(current_score), COUNT(*)
  INTO v_avg, v_total
  FROM psfs_activities
  WHERE assessment_id = p_assessment_id;

  -- Get baseline (first assessment for user)
  SELECT pa.* INTO v_baseline
  FROM psfs_assessments pa
  WHERE pa.user_id = v_assessment.user_id
  ORDER BY pa.assessment_date ASC
  LIMIT 1;

  -- Calculate baseline average if exists
  IF v_baseline.id IS NOT NULL AND v_baseline.id != p_assessment_id THEN
    SELECT AVG(current_score)
    INTO v_baseline_avg
    FROM psfs_activities
    WHERE assessment_id = v_baseline.id;

    -- Count improved activities
    SELECT COUNT(*)
    INTO v_improved
    FROM psfs_activities a1
    JOIN psfs_activities a2 ON a1.activity_name = a2.activity_name
    WHERE a1.assessment_id = p_assessment_id
    AND a2.assessment_id = v_baseline.id
    AND a1.current_score > a2.current_score;
  ELSE
    v_baseline_avg := NULL;
    v_improved := 0;
  END IF;

  RETURN QUERY
  SELECT
    v_avg,
    CASE WHEN v_baseline_avg IS NOT NULL THEN v_avg - v_baseline_avg ELSE NULL END,
    CASE WHEN v_baseline_avg IS NOT NULL THEN (v_avg - v_baseline_avg) >= v_mcid ELSE FALSE END,
    v_improved,
    v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_promis29_change TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_psfs_metrics TO authenticated;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- PROMIS-29 Progress View
CREATE OR REPLACE VIEW promis29_progress AS
SELECT
  user_id,
  assessment_date,
  assessment_type,
  physical_function_tscore,
  anxiety_tscore,
  depression_tscore,
  fatigue_tscore,
  sleep_disturbance_tscore,
  social_roles_tscore,
  pain_interference_tscore,
  pain_intensity,
  -- Calculate overall health score (inverse average of symptom domains)
  ROUND(
    (100 - (
      COALESCE(anxiety_tscore, 50) +
      COALESCE(depression_tscore, 50) +
      COALESCE(fatigue_tscore, 50) +
      COALESCE(sleep_disturbance_tscore, 50) +
      COALESCE(pain_interference_tscore, 50)
    ) / 5 + COALESCE(physical_function_tscore, 50) + COALESCE(social_roles_tscore, 50)) / 3
  , 1) as overall_health_index
FROM promis29_assessments
ORDER BY user_id, assessment_date;

-- PSFS Progress View
CREATE OR REPLACE VIEW psfs_progress AS
SELECT
  pa.user_id,
  pa.assessment_date,
  pa.assessment_type,
  pa.average_score,
  pa.total_activities,
  pa.mcid_achieved,
  pa.change_from_baseline,
  COUNT(act.id) as activity_count,
  AVG(act.current_score) as calculated_average
FROM psfs_assessments pa
LEFT JOIN psfs_activities act ON act.assessment_id = pa.id
GROUP BY pa.id, pa.user_id, pa.assessment_date, pa.assessment_type,
         pa.average_score, pa.total_activities, pa.mcid_achieved, pa.change_from_baseline
ORDER BY pa.user_id, pa.assessment_date;

-- Grant access to views
GRANT SELECT ON promis29_progress TO authenticated;
GRANT SELECT ON psfs_progress TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger for PROMIS-29
CREATE OR REPLACE FUNCTION update_promis29_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_promis29_assessments_updated_at
  BEFORE UPDATE ON promis29_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_promis29_updated_at();

-- Update timestamp trigger for PSFS
CREATE OR REPLACE FUNCTION update_psfs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_psfs_assessments_updated_at
  BEFORE UPDATE ON psfs_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_psfs_updated_at();

-- Auto-calculate PSFS metrics on activity insert
CREATE OR REPLACE FUNCTION auto_calculate_psfs_average()
RETURNS TRIGGER AS $$
DECLARE
  v_avg NUMERIC;
  v_count INTEGER;
BEGIN
  -- Calculate new average
  SELECT AVG(current_score), COUNT(*)
  INTO v_avg, v_count
  FROM psfs_activities
  WHERE assessment_id = NEW.assessment_id;

  -- Update assessment
  UPDATE psfs_assessments
  SET
    average_score = v_avg,
    total_activities = v_count,
    updated_at = NOW()
  WHERE id = NEW.assessment_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_psfs_average
  AFTER INSERT OR UPDATE ON psfs_activities
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_psfs_average();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE promis29_assessments IS 'PROMIS-29 standardized health assessment with 8 domains measuring physical function, mental health, fatigue, sleep, social roles, and pain';
COMMENT ON TABLE psfs_assessments IS 'Patient-Specific Functional Scale (PSFS) assessments tracking patient-defined functional goals';
COMMENT ON TABLE psfs_activities IS 'Individual activities/goals for each PSFS assessment with 0-10 difficulty scoring';
COMMENT ON FUNCTION calculate_promis29_change IS 'Calculates change from baseline for all PROMIS-29 domains with MCID tracking';
COMMENT ON FUNCTION calculate_psfs_metrics IS 'Calculates PSFS average score, change from baseline, and MCID achievement';
COMMENT ON VIEW promis29_progress IS 'Longitudinal view of PROMIS-29 scores with calculated overall health index';
COMMENT ON VIEW psfs_progress IS 'Longitudinal view of PSFS scores with activity details';
