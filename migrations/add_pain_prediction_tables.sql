-- ============================================================================
-- PAIN PREDICTION TABLES MIGRATION
-- ============================================================================
-- Stores pain predictions and tracking data for ML-based pain forecasting

-- Create pain_predictions table
CREATE TABLE IF NOT EXISTS pain_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_date TIMESTAMPTZ NOT NULL,
  horizon_24h NUMERIC NOT NULL CHECK (horizon_24h >= 0 AND horizon_24h <= 10),
  horizon_48h NUMERIC NOT NULL CHECK (horizon_48h >= 0 AND horizon_48h <= 10),
  confidence_24h NUMERIC CHECK (confidence_24h >= 0 AND confidence_24h <= 1),
  confidence_48h NUMERIC CHECK (confidence_48h >= 0 AND confidence_48h <= 1),
  risk_level_24h TEXT CHECK (risk_level_24h IN ('low', 'moderate', 'high', 'critical')),
  risk_level_48h TEXT CHECK (risk_level_48h IN ('low', 'moderate', 'high', 'critical')),
  model_version TEXT NOT NULL,
  actual_pain_24h NUMERIC CHECK (actual_pain_24h >= 0 AND actual_pain_24h <= 10),
  actual_pain_48h NUMERIC CHECK (actual_pain_48h >= 0 AND actual_pain_48h <= 10),
  prediction_error_24h NUMERIC,
  prediction_error_48h NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pain_predictions_user_id ON pain_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_pain_predictions_date ON pain_predictions(prediction_date);
CREATE INDEX IF NOT EXISTS idx_pain_predictions_user_date ON pain_predictions(user_id, prediction_date DESC);

-- Enable RLS
ALTER TABLE pain_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own pain predictions"
  ON pain_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pain predictions"
  ON pain_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pain predictions"
  ON pain_predictions FOR UPDATE
  USING (auth.uid() = user_id);

-- Providers can view patient predictions
CREATE POLICY "Providers can view patient pain predictions"
  ON pain_predictions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provider_patients
      WHERE provider_patients.patient_id = pain_predictions.user_id
      AND provider_patients.provider_id = auth.uid()
    )
  );

-- Create pain_prediction_factors table (stores contributing factors for each prediction)
CREATE TABLE IF NOT EXISTS pain_prediction_factors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES pain_predictions(id) ON DELETE CASCADE,
  factor_name TEXT NOT NULL,
  impact_score NUMERIC NOT NULL CHECK (impact_score >= -1 AND impact_score <= 1),
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for factors
CREATE INDEX IF NOT EXISTS idx_prediction_factors_prediction_id ON pain_prediction_factors(prediction_id);

-- Enable RLS
ALTER TABLE pain_prediction_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their pain prediction factors"
  ON pain_prediction_factors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pain_predictions
      WHERE pain_predictions.id = pain_prediction_factors.prediction_id
      AND pain_predictions.user_id = auth.uid()
    )
  );

-- Create pain_prediction_accuracy table (tracks model performance)
CREATE TABLE IF NOT EXISTS pain_prediction_accuracy (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  model_version TEXT NOT NULL,
  date_range_start TIMESTAMPTZ NOT NULL,
  date_range_end TIMESTAMPTZ NOT NULL,
  total_predictions INTEGER NOT NULL,
  mae_24h NUMERIC, -- Mean Absolute Error
  mae_48h NUMERIC,
  rmse_24h NUMERIC, -- Root Mean Squared Error
  rmse_48h NUMERIC,
  accuracy_within_1point_24h NUMERIC, -- % predictions within 1 point
  accuracy_within_1point_48h NUMERIC,
  accuracy_within_2points_24h NUMERIC,
  accuracy_within_2points_48h NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for accuracy tracking
CREATE INDEX IF NOT EXISTS idx_prediction_accuracy_user ON pain_prediction_accuracy(user_id);
CREATE INDEX IF NOT EXISTS idx_prediction_accuracy_version ON pain_prediction_accuracy(model_version);

-- Enable RLS
ALTER TABLE pain_prediction_accuracy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their prediction accuracy"
  ON pain_prediction_accuracy FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create function to calculate prediction accuracy
CREATE OR REPLACE FUNCTION calculate_prediction_accuracy(
  p_user_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  mae_24h NUMERIC,
  mae_48h NUMERIC,
  accuracy_1point_24h NUMERIC,
  accuracy_1point_48h NUMERIC,
  total_predictions INTEGER
) AS $$
DECLARE
  v_total INTEGER;
  v_mae_24 NUMERIC;
  v_mae_48 NUMERIC;
  v_acc_1pt_24 NUMERIC;
  v_acc_1pt_48 NUMERIC;
BEGIN
  -- Count total predictions with actual outcomes
  SELECT COUNT(*)
  INTO v_total
  FROM pain_predictions
  WHERE user_id = p_user_id
    AND prediction_date >= CURRENT_DATE - p_days_back
    AND actual_pain_24h IS NOT NULL;

  IF v_total = 0 THEN
    RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 0;
    RETURN;
  END IF;

  -- Calculate MAE for 24h
  SELECT AVG(ABS(horizon_24h - actual_pain_24h))
  INTO v_mae_24
  FROM pain_predictions
  WHERE user_id = p_user_id
    AND prediction_date >= CURRENT_DATE - p_days_back
    AND actual_pain_24h IS NOT NULL;

  -- Calculate MAE for 48h
  SELECT AVG(ABS(horizon_48h - actual_pain_48h))
  INTO v_mae_48
  FROM pain_predictions
  WHERE user_id = p_user_id
    AND prediction_date >= CURRENT_DATE - p_days_back
    AND actual_pain_48h IS NOT NULL;

  -- Calculate accuracy within 1 point for 24h
  SELECT
    COUNT(CASE WHEN ABS(horizon_24h - actual_pain_24h) <= 1 THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100
  INTO v_acc_1pt_24
  FROM pain_predictions
  WHERE user_id = p_user_id
    AND prediction_date >= CURRENT_DATE - p_days_back
    AND actual_pain_24h IS NOT NULL;

  -- Calculate accuracy within 1 point for 48h
  SELECT
    COUNT(CASE WHEN ABS(horizon_48h - actual_pain_48h) <= 1 THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100
  INTO v_acc_1pt_48
  FROM pain_predictions
  WHERE user_id = p_user_id
    AND prediction_date >= CURRENT_DATE - p_days_back
    AND actual_pain_48h IS NOT NULL;

  RETURN QUERY SELECT
    COALESCE(v_mae_24, 0),
    COALESCE(v_mae_48, 0),
    COALESCE(v_acc_1pt_24, 0),
    COALESCE(v_acc_1pt_48, 0),
    v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute
GRANT EXECUTE ON FUNCTION calculate_prediction_accuracy TO authenticated;

-- Create function to update actual pain values (called when user logs pain after prediction)
CREATE OR REPLACE FUNCTION update_prediction_actual_pain(
  p_user_id UUID,
  p_pain_level NUMERIC,
  p_pain_date TIMESTAMPTZ
)
RETURNS VOID AS $$
DECLARE
  v_prediction RECORD;
  v_hours_diff NUMERIC;
BEGIN
  -- Find predictions made 24h and 48h before this pain log
  FOR v_prediction IN
    SELECT *
    FROM pain_predictions
    WHERE user_id = p_user_id
      AND prediction_date >= p_pain_date - INTERVAL '50 hours'
      AND prediction_date <= p_pain_date - INTERVAL '20 hours'
    ORDER BY prediction_date DESC
  LOOP
    -- Calculate hours difference
    v_hours_diff := EXTRACT(EPOCH FROM (p_pain_date - v_prediction.prediction_date)) / 3600;

    -- Update 24h actual if within range
    IF v_hours_diff >= 22 AND v_hours_diff <= 26 AND v_prediction.actual_pain_24h IS NULL THEN
      UPDATE pain_predictions
      SET
        actual_pain_24h = p_pain_level,
        prediction_error_24h = ABS(horizon_24h - p_pain_level),
        updated_at = NOW()
      WHERE id = v_prediction.id;
    END IF;

    -- Update 48h actual if within range
    IF v_hours_diff >= 46 AND v_hours_diff <= 50 AND v_prediction.actual_pain_48h IS NULL THEN
      UPDATE pain_predictions
      SET
        actual_pain_48h = p_pain_level,
        prediction_error_48h = ABS(horizon_48h - p_pain_level),
        updated_at = NOW()
      WHERE id = v_prediction.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute
GRANT EXECUTE ON FUNCTION update_prediction_actual_pain TO authenticated;

-- Create view for prediction performance dashboard
CREATE OR REPLACE VIEW pain_prediction_performance AS
SELECT
  user_id,
  model_version,
  COUNT(*) as total_predictions,
  AVG(CASE WHEN actual_pain_24h IS NOT NULL THEN prediction_error_24h END) as avg_error_24h,
  AVG(CASE WHEN actual_pain_48h IS NOT NULL THEN prediction_error_48h END) as avg_error_48h,
  COUNT(CASE WHEN actual_pain_24h IS NOT NULL AND prediction_error_24h <= 1 THEN 1 END) as accurate_24h_count,
  COUNT(CASE WHEN actual_pain_48h IS NOT NULL AND prediction_error_48h <= 1 THEN 1 END) as accurate_48h_count,
  MAX(prediction_date) as last_prediction_date
FROM pain_predictions
WHERE prediction_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id, model_version;

-- Grant access
GRANT SELECT ON pain_prediction_performance TO authenticated;

-- Create trigger to auto-update prediction errors
CREATE OR REPLACE FUNCTION update_prediction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pain_predictions_updated_at
  BEFORE UPDATE ON pain_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_prediction_updated_at();

-- Comments for documentation
COMMENT ON TABLE pain_predictions IS 'Stores ML-based pain predictions with 24h and 48h horizons for proactive pain management';
COMMENT ON TABLE pain_prediction_factors IS 'Stores contributing factors (sleep, movement, etc.) for each prediction';
COMMENT ON TABLE pain_prediction_accuracy IS 'Tracks model performance metrics over time for continuous improvement';
COMMENT ON FUNCTION calculate_prediction_accuracy IS 'Calculates prediction accuracy metrics (MAE, percentage within 1 point)';
COMMENT ON FUNCTION update_prediction_actual_pain IS 'Automatically updates predictions with actual pain values for validation';
COMMENT ON VIEW pain_prediction_performance IS 'Aggregated view of prediction performance by user and model version';
