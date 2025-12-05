-- ============================================================================
-- OUTCOME PREDICTIONS TABLES MIGRATION
-- ============================================================================
-- Predictive analytics for forecasting patient outcomes including:
-- - Predicted final ODI/PSFS scores
-- - Discharge timeline estimation
-- - MCID (Minimal Clinically Important Difference) probability
-- - Cohort comparison for similar patients

-- ============================================================================
-- OUTCOME PREDICTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS outcome_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES auth.users(id),

  -- Prediction type: initial (baseline), interim (during treatment), final (discharge)
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('initial', 'interim', 'final')),

  -- Predicted outcome scores
  predicted_final_odi NUMERIC(5,2) CHECK (predicted_final_odi >= 0 AND predicted_final_odi <= 100),
  predicted_final_psfs NUMERIC(5,2) CHECK (predicted_final_psfs >= 0 AND predicted_final_psfs <= 10),
  predicted_final_vas NUMERIC(5,2) CHECK (predicted_final_vas >= 0 AND predicted_final_vas <= 10),
  predicted_final_promis_pain NUMERIC(5,2),
  predicted_final_promis_function NUMERIC(5,2),

  -- Change predictions (improvement from baseline)
  predicted_odi_change NUMERIC(5,2),
  predicted_psfs_change NUMERIC(5,2),
  predicted_pain_reduction NUMERIC(5,2),

  -- Timeline predictions
  predicted_discharge_week INTEGER CHECK (predicted_discharge_week >= 1 AND predicted_discharge_week <= 52),
  predicted_phase_completion_weeks JSONB DEFAULT '[]'::jsonb,
  -- Format: [{ "phase": 1, "predicted_weeks": 3 }, { "phase": 2, "predicted_weeks": 4 }]

  -- Success probability
  mcid_probability NUMERIC(5,4) CHECK (mcid_probability >= 0 AND mcid_probability <= 1),
  success_probability NUMERIC(5,4) CHECK (success_probability >= 0 AND success_probability <= 1),
  -- success = achieving functional goals or >50% improvement

  -- Confidence metrics
  confidence_score NUMERIC(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  confidence_interval_lower NUMERIC(5,2),
  confidence_interval_upper NUMERIC(5,2),

  -- Risk factors that may affect outcomes
  risk_factors JSONB DEFAULT '[]'::jsonb,
  -- Format: [{ "factor": "high_tsk11", "impact": -0.15, "description": "Hög rörelserädsla kan fördröja återhämtning" }]

  -- Positive factors supporting good outcomes
  protective_factors JSONB DEFAULT '[]'::jsonb,
  -- Format: [{ "factor": "high_adherence", "impact": 0.2, "description": "God följsamhet ökar chansen för framgång" }]

  -- Model information
  model_version TEXT NOT NULL DEFAULT '1.0',
  features_used JSONB DEFAULT '{}'::jsonb,
  -- Format: { "baseline_odi": 45, "tsk11": 32, "age": 42, "adherence_week2": 85, ... }

  -- Actual outcomes (filled when discharged for model validation)
  actual_final_odi NUMERIC(5,2),
  actual_final_psfs NUMERIC(5,2),
  actual_discharge_week INTEGER,
  mcid_achieved BOOLEAN,
  prediction_error NUMERIC(5,2), -- MAE between predicted and actual

  -- Cohort comparison data
  cohort_id TEXT, -- Identifier for comparison cohort
  cohort_percentile INTEGER CHECK (cohort_percentile >= 0 AND cohort_percentile <= 100),
  -- Where patient's predicted outcome falls in cohort

  -- Review tracking
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_outcome_predictions_user_id ON outcome_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_outcome_predictions_provider_id ON outcome_predictions(provider_id);
CREATE INDEX IF NOT EXISTS idx_outcome_predictions_type ON outcome_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_outcome_predictions_created_at ON outcome_predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outcome_predictions_user_date ON outcome_predictions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outcome_predictions_cohort ON outcome_predictions(cohort_id);

-- Enable RLS
ALTER TABLE outcome_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own outcome predictions"
  ON outcome_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can view patient outcome predictions"
  ON outcome_predictions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provider_patients
      WHERE provider_patients.patient_id = outcome_predictions.user_id
      AND provider_patients.provider_id = auth.uid()
    )
  );

CREATE POLICY "Providers can insert patient outcome predictions"
  ON outcome_predictions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM provider_patients
      WHERE provider_patients.patient_id = outcome_predictions.user_id
      AND provider_patients.provider_id = auth.uid()
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Providers can update patient outcome predictions"
  ON outcome_predictions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM provider_patients
      WHERE provider_patients.patient_id = outcome_predictions.user_id
      AND provider_patients.provider_id = auth.uid()
    )
  );

-- ============================================================================
-- PREDICTION COHORTS TABLE
-- ============================================================================
-- Define patient cohorts for comparison (similar patients by condition, severity, demographics)

CREATE TABLE IF NOT EXISTS prediction_cohorts (
  id TEXT PRIMARY KEY, -- e.g., 'lbp_moderate_40-50'
  name TEXT NOT NULL,
  description TEXT,

  -- Cohort criteria
  condition_category TEXT, -- 'low_back', 'knee', 'shoulder', etc.
  severity_range_min NUMERIC(5,2),
  severity_range_max NUMERIC(5,2),
  age_range_min INTEGER,
  age_range_max INTEGER,

  -- Cohort statistics (updated periodically)
  sample_size INTEGER DEFAULT 0,
  avg_baseline_odi NUMERIC(5,2),
  avg_final_odi NUMERIC(5,2),
  avg_improvement NUMERIC(5,2),
  avg_weeks_to_discharge NUMERIC(5,2),
  mcid_achievement_rate NUMERIC(5,4),

  -- Outcome distribution for comparison
  outcome_percentiles JSONB DEFAULT '{}'::jsonb,
  -- Format: { "p10": 15, "p25": 22, "p50": 30, "p75": 38, "p90": 45 }

  -- Timeline distribution
  discharge_week_percentiles JSONB DEFAULT '{}'::jsonb,
  -- Format: { "p10": 6, "p25": 8, "p50": 10, "p75": 14, "p90": 18 }

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prediction_cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prediction cohorts"
  ON prediction_cohorts FOR SELECT
  USING (true);

-- ============================================================================
-- PREDICTION MODEL PERFORMANCE TABLE
-- ============================================================================
-- Track model accuracy over time for continuous improvement

CREATE TABLE IF NOT EXISTS prediction_model_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Model info
  model_version TEXT NOT NULL,
  model_type TEXT NOT NULL, -- 'odi_prediction', 'psfs_prediction', 'discharge_timing'

  -- Performance window
  evaluation_start DATE NOT NULL,
  evaluation_end DATE NOT NULL,

  -- Sample metrics
  sample_size INTEGER NOT NULL,
  predictions_with_actuals INTEGER NOT NULL,

  -- Accuracy metrics
  mae NUMERIC(6,3), -- Mean Absolute Error
  rmse NUMERIC(6,3), -- Root Mean Square Error
  mape NUMERIC(6,3), -- Mean Absolute Percentage Error
  r_squared NUMERIC(6,4), -- Coefficient of determination

  -- Classification metrics (for MCID prediction)
  accuracy NUMERIC(5,4),
  precision_score NUMERIC(5,4),
  recall_score NUMERIC(5,4),
  f1_score NUMERIC(5,4),
  auc_roc NUMERIC(5,4),

  -- Calibration metrics
  calibration_slope NUMERIC(6,4),
  calibration_intercept NUMERIC(6,4),
  brier_score NUMERIC(6,4),

  -- Subgroup performance
  subgroup_metrics JSONB DEFAULT '{}'::jsonb,
  -- Format: { "high_severity": { "mae": 8.2 }, "low_severity": { "mae": 5.1 } }

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prediction_model_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view model performance"
  ON prediction_model_performance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'provider'
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate MCID achievement probability
CREATE OR REPLACE FUNCTION calculate_mcid_probability(
  p_baseline_odi NUMERIC,
  p_predicted_final_odi NUMERIC,
  p_mcid_threshold NUMERIC DEFAULT 10
)
RETURNS NUMERIC AS $$
DECLARE
  v_predicted_improvement NUMERIC;
  v_probability NUMERIC;
BEGIN
  -- Calculate predicted improvement
  v_predicted_improvement := p_baseline_odi - p_predicted_final_odi;

  -- Simple sigmoid-based probability calculation
  -- This should be replaced with actual ML model output in production
  IF v_predicted_improvement >= p_mcid_threshold * 1.5 THEN
    v_probability := 0.95;
  ELSIF v_predicted_improvement >= p_mcid_threshold THEN
    v_probability := 0.75 + (v_predicted_improvement - p_mcid_threshold) * 0.04;
  ELSIF v_predicted_improvement >= p_mcid_threshold * 0.5 THEN
    v_probability := 0.5 + (v_predicted_improvement - p_mcid_threshold * 0.5) * 0.05;
  ELSE
    v_probability := v_predicted_improvement / p_mcid_threshold * 0.5;
  END IF;

  RETURN GREATEST(0, LEAST(1, v_probability));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get patient's cohort
CREATE OR REPLACE FUNCTION get_patient_cohort(
  p_user_id UUID,
  p_condition TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_age INTEGER;
  v_baseline_odi NUMERIC;
  v_cohort_id TEXT;
BEGIN
  -- Get patient age from profiles
  SELECT EXTRACT(YEAR FROM AGE(date_of_birth))::INTEGER
  INTO v_age
  FROM profiles
  WHERE id = p_user_id;

  -- Get baseline ODI
  SELECT score
  INTO v_baseline_odi
  FROM odi_assessments
  WHERE user_id = p_user_id
  ORDER BY created_at ASC
  LIMIT 1;

  -- Determine cohort based on condition, severity, and age
  -- Format: {condition}_{severity}_{age_range}
  v_cohort_id := COALESCE(p_condition, 'general') || '_';

  IF v_baseline_odi >= 60 THEN
    v_cohort_id := v_cohort_id || 'severe_';
  ELSIF v_baseline_odi >= 40 THEN
    v_cohort_id := v_cohort_id || 'moderate_';
  ELSIF v_baseline_odi >= 20 THEN
    v_cohort_id := v_cohort_id || 'mild_';
  ELSE
    v_cohort_id := v_cohort_id || 'minimal_';
  END IF;

  IF v_age < 30 THEN
    v_cohort_id := v_cohort_id || '18-29';
  ELSIF v_age < 45 THEN
    v_cohort_id := v_cohort_id || '30-44';
  ELSIF v_age < 60 THEN
    v_cohort_id := v_cohort_id || '45-59';
  ELSE
    v_cohort_id := v_cohort_id || '60+';
  END IF;

  RETURN v_cohort_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get latest outcome prediction for a patient
CREATE OR REPLACE FUNCTION get_latest_outcome_prediction(p_user_id UUID)
RETURNS outcome_predictions AS $$
DECLARE
  v_prediction outcome_predictions;
BEGIN
  SELECT * INTO v_prediction
  FROM outcome_predictions
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN v_prediction;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate prediction error when actual outcomes available
CREATE OR REPLACE FUNCTION update_prediction_actuals(
  p_user_id UUID,
  p_actual_final_odi NUMERIC,
  p_actual_final_psfs NUMERIC,
  p_actual_discharge_week INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE outcome_predictions
  SET
    actual_final_odi = p_actual_final_odi,
    actual_final_psfs = p_actual_final_psfs,
    actual_discharge_week = p_actual_discharge_week,
    mcid_achieved = CASE
      WHEN predicted_final_odi IS NOT NULL AND p_actual_final_odi IS NOT NULL
      THEN (
        SELECT odi.score - p_actual_final_odi >= 10
        FROM odi_assessments odi
        WHERE odi.user_id = p_user_id
        ORDER BY odi.created_at ASC
        LIMIT 1
      )
      ELSE NULL
    END,
    prediction_error = CASE
      WHEN predicted_final_odi IS NOT NULL AND p_actual_final_odi IS NOT NULL
      THEN ABS(predicted_final_odi - p_actual_final_odi)
      ELSE NULL
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND prediction_type = 'initial';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get provider's outcome prediction summary
CREATE OR REPLACE FUNCTION get_provider_outcome_summary(p_provider_id UUID)
RETURNS TABLE(
  total_patients INTEGER,
  patients_with_predictions INTEGER,
  avg_mcid_probability NUMERIC,
  avg_predicted_improvement NUMERIC,
  high_success_count INTEGER,
  moderate_success_count INTEGER,
  low_success_count INTEGER,
  avg_discharge_weeks NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH patient_predictions AS (
    SELECT DISTINCT ON (pp.patient_id)
      pp.patient_id,
      op.mcid_probability,
      op.predicted_odi_change,
      op.success_probability,
      op.predicted_discharge_week
    FROM provider_patients pp
    LEFT JOIN outcome_predictions op ON op.user_id = pp.patient_id
    WHERE pp.provider_id = p_provider_id
      AND pp.status = 'active'
    ORDER BY pp.patient_id, op.created_at DESC
  )
  SELECT
    COUNT(*)::INTEGER as total_patients,
    COUNT(mcid_probability)::INTEGER as patients_with_predictions,
    ROUND(AVG(mcid_probability), 2) as avg_mcid_probability,
    ROUND(AVG(predicted_odi_change), 1) as avg_predicted_improvement,
    COUNT(CASE WHEN success_probability >= 0.75 THEN 1 END)::INTEGER as high_success_count,
    COUNT(CASE WHEN success_probability >= 0.5 AND success_probability < 0.75 THEN 1 END)::INTEGER as moderate_success_count,
    COUNT(CASE WHEN success_probability < 0.5 THEN 1 END)::INTEGER as low_success_count,
    ROUND(AVG(predicted_discharge_week), 1) as avg_discharge_weeks
  FROM patient_predictions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_mcid_probability TO authenticated;
GRANT EXECUTE ON FUNCTION get_patient_cohort TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_outcome_prediction TO authenticated;
GRANT EXECUTE ON FUNCTION update_prediction_actuals TO authenticated;
GRANT EXECUTE ON FUNCTION get_provider_outcome_summary TO authenticated;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for provider's patient outcome predictions
CREATE OR REPLACE VIEW provider_patient_predictions AS
SELECT DISTINCT ON (pp.patient_id)
  pp.provider_id,
  pp.patient_id,
  pp.status as patient_status,
  op.id as prediction_id,
  op.prediction_type,
  op.predicted_final_odi,
  op.predicted_final_psfs,
  op.predicted_odi_change,
  op.predicted_discharge_week,
  op.mcid_probability,
  op.success_probability,
  op.confidence_score,
  op.risk_factors,
  op.protective_factors,
  op.cohort_id,
  op.cohort_percentile,
  op.created_at as prediction_date
FROM provider_patients pp
LEFT JOIN outcome_predictions op ON op.user_id = pp.patient_id
WHERE pp.status = 'active'
ORDER BY pp.patient_id, op.created_at DESC;

-- Grant access to view
GRANT SELECT ON provider_patient_predictions TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_outcome_prediction_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_outcome_predictions_timestamp
  BEFORE UPDATE ON outcome_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_outcome_prediction_timestamp();

-- ============================================================================
-- INSERT DEFAULT COHORTS
-- ============================================================================

INSERT INTO prediction_cohorts (id, name, description, condition_category, severity_range_min, severity_range_max, age_range_min, age_range_max)
VALUES
  ('lbp_severe_18-29', 'Ryggsmärta - Svår - 18-29 år', 'Patienter 18-29 år med svår ryggsmärta (ODI 60-100)', 'low_back', 60, 100, 18, 29),
  ('lbp_severe_30-44', 'Ryggsmärta - Svår - 30-44 år', 'Patienter 30-44 år med svår ryggsmärta (ODI 60-100)', 'low_back', 60, 100, 30, 44),
  ('lbp_severe_45-59', 'Ryggsmärta - Svår - 45-59 år', 'Patienter 45-59 år med svår ryggsmärta (ODI 60-100)', 'low_back', 60, 100, 45, 59),
  ('lbp_severe_60+', 'Ryggsmärta - Svår - 60+ år', 'Patienter 60+ år med svår ryggsmärta (ODI 60-100)', 'low_back', 60, 100, 60, 120),
  ('lbp_moderate_18-29', 'Ryggsmärta - Måttlig - 18-29 år', 'Patienter 18-29 år med måttlig ryggsmärta (ODI 40-59)', 'low_back', 40, 59, 18, 29),
  ('lbp_moderate_30-44', 'Ryggsmärta - Måttlig - 30-44 år', 'Patienter 30-44 år med måttlig ryggsmärta (ODI 40-59)', 'low_back', 40, 59, 30, 44),
  ('lbp_moderate_45-59', 'Ryggsmärta - Måttlig - 45-59 år', 'Patienter 45-59 år med måttlig ryggsmärta (ODI 40-59)', 'low_back', 40, 59, 45, 59),
  ('lbp_moderate_60+', 'Ryggsmärta - Måttlig - 60+ år', 'Patienter 60+ år med måttlig ryggsmärta (ODI 40-59)', 'low_back', 40, 59, 60, 120),
  ('lbp_mild_18-29', 'Ryggsmärta - Mild - 18-29 år', 'Patienter 18-29 år med mild ryggsmärta (ODI 20-39)', 'low_back', 20, 39, 18, 29),
  ('lbp_mild_30-44', 'Ryggsmärta - Mild - 30-44 år', 'Patienter 30-44 år med mild ryggsmärta (ODI 20-39)', 'low_back', 20, 39, 30, 44),
  ('lbp_mild_45-59', 'Ryggsmärta - Mild - 45-59 år', 'Patienter 45-59 år med mild ryggsmärta (ODI 20-39)', 'low_back', 20, 39, 45, 59),
  ('lbp_mild_60+', 'Ryggsmärta - Mild - 60+ år', 'Patienter 60+ år med mild ryggsmärta (ODI 20-39)', 'low_back', 20, 39, 60, 120),
  ('knee_severe_18-44', 'Knä - Svår - 18-44 år', 'Patienter 18-44 år med svår knäfunktionsnedsättning', 'knee', 60, 100, 18, 44),
  ('knee_severe_45+', 'Knä - Svår - 45+ år', 'Patienter 45+ år med svår knäfunktionsnedsättning', 'knee', 60, 100, 45, 120),
  ('knee_moderate_18-44', 'Knä - Måttlig - 18-44 år', 'Patienter 18-44 år med måttlig knäfunktionsnedsättning', 'knee', 40, 59, 18, 44),
  ('knee_moderate_45+', 'Knä - Måttlig - 45+ år', 'Patienter 45+ år med måttlig knäfunktionsnedsättning', 'knee', 40, 59, 45, 120),
  ('shoulder_any_18-44', 'Axel - 18-44 år', 'Patienter 18-44 år med axelbesvär', 'shoulder', 0, 100, 18, 44),
  ('shoulder_any_45+', 'Axel - 45+ år', 'Patienter 45+ år med axelbesvär', 'shoulder', 0, 100, 45, 120),
  ('hip_any_18-59', 'Höft - 18-59 år', 'Patienter 18-59 år med höftbesvär', 'hip', 0, 100, 18, 59),
  ('hip_any_60+', 'Höft - 60+ år', 'Patienter 60+ år med höftbesvär', 'hip', 0, 100, 60, 120)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE outcome_predictions IS 'ML-based predictions of patient rehabilitation outcomes including ODI, PSFS, discharge timing, and MCID probability';
COMMENT ON TABLE prediction_cohorts IS 'Cohort definitions for comparing patient outcomes with similar patients';
COMMENT ON TABLE prediction_model_performance IS 'Tracking prediction model accuracy and calibration over time';
COMMENT ON FUNCTION calculate_mcid_probability IS 'Estimates probability of achieving Minimal Clinically Important Difference';
COMMENT ON FUNCTION get_patient_cohort IS 'Determines which comparison cohort a patient belongs to based on condition, severity, and demographics';
COMMENT ON FUNCTION get_latest_outcome_prediction IS 'Returns most recent outcome prediction for a patient';
COMMENT ON FUNCTION update_prediction_actuals IS 'Updates prediction records with actual outcomes for model validation';
COMMENT ON FUNCTION get_provider_outcome_summary IS 'Returns aggregate outcome prediction statistics for a providers patient panel';
COMMENT ON VIEW provider_patient_predictions IS 'Latest outcome prediction for each patient assigned to a provider';
