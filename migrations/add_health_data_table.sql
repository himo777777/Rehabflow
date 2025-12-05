-- ============================================================================
-- HEALTH DATA TABLE MIGRATION
-- ============================================================================
-- Stores health data from Apple HealthKit, Google Fit, and manual entry
-- Supports passive data collection for rehabilitation insights

-- Create health_data table
CREATE TABLE IF NOT EXISTS health_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  source TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Composite unique constraint to prevent duplicates
  CONSTRAINT unique_health_data UNIQUE (user_id, data_type, start_date, source)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_health_data_user_id ON health_data(user_id);
CREATE INDEX IF NOT EXISTS idx_health_data_type ON health_data(data_type);
CREATE INDEX IF NOT EXISTS idx_health_data_dates ON health_data(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_health_data_user_type_dates ON health_data(user_id, data_type, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_health_data_created_at ON health_data(created_at);

-- Enable Row Level Security
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only access their own health data
CREATE POLICY "Users can view their own health data"
  ON health_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health data"
  ON health_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health data"
  ON health_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health data"
  ON health_data FOR DELETE
  USING (auth.uid() = user_id);

-- Providers can view patient health data
CREATE POLICY "Providers can view patient health data"
  ON health_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provider_patients
      WHERE provider_patients.patient_id = health_data.user_id
      AND provider_patients.provider_id = auth.uid()
    )
  );

-- Create health_data_sync_log table to track synchronization
CREATE TABLE IF NOT EXISTS health_data_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_date TIMESTAMPTZ DEFAULT NOW(),
  data_types TEXT[] NOT NULL,
  data_points_synced INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  errors JSONB DEFAULT '[]'::jsonb,
  source TEXT NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for sync log
CREATE INDEX IF NOT EXISTS idx_sync_log_user_id ON health_data_sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_date ON health_data_sync_log(sync_date);

-- Enable RLS for sync log
ALTER TABLE health_data_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync log"
  ON health_data_sync_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync log"
  ON health_data_sync_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create health_data_preferences table for user settings
CREATE TABLE IF NOT EXISTS health_data_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_interval_minutes INTEGER DEFAULT 240, -- 4 hours
  enabled_data_types TEXT[] DEFAULT ARRAY[
    'steps',
    'distance',
    'active_energy',
    'heart_rate',
    'hrv',
    'resting_heart_rate',
    'sleep_analysis',
    'weight'
  ],
  authorized_sources TEXT[] DEFAULT ARRAY['healthkit'],
  last_sync_date TIMESTAMPTZ,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for preferences
CREATE INDEX IF NOT EXISTS idx_health_prefs_user_id ON health_data_preferences(user_id);

-- Enable RLS for preferences
ALTER TABLE health_data_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON health_data_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON health_data_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON health_data_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_health_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for health_data
CREATE TRIGGER update_health_data_updated_at
  BEFORE UPDATE ON health_data
  FOR EACH ROW
  EXECUTE FUNCTION update_health_data_updated_at();

-- Trigger for health_data_preferences
CREATE TRIGGER update_health_prefs_updated_at
  BEFORE UPDATE ON health_data_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_health_data_updated_at();

-- Create view for daily activity summary
CREATE OR REPLACE VIEW daily_activity_summary AS
SELECT
  user_id,
  DATE(start_date) as activity_date,
  SUM(CASE WHEN data_type = 'steps' THEN value ELSE 0 END) as total_steps,
  SUM(CASE WHEN data_type = 'distance' THEN value ELSE 0 END) as total_distance,
  SUM(CASE WHEN data_type = 'active_energy' THEN value ELSE 0 END) as total_calories,
  AVG(CASE WHEN data_type = 'heart_rate' THEN value ELSE NULL END) as avg_heart_rate,
  AVG(CASE WHEN data_type = 'hrv' THEN value ELSE NULL END) as avg_hrv,
  SUM(CASE WHEN data_type = 'sleep_analysis' THEN value ELSE 0 END) / 60.0 as sleep_hours,
  COUNT(DISTINCT CASE WHEN data_type = 'workout' THEN id ELSE NULL END) as workout_count
FROM health_data
WHERE DATE(start_date) >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id, DATE(start_date)
ORDER BY user_id, activity_date DESC;

-- Grant access to view
GRANT SELECT ON daily_activity_summary TO authenticated;

-- Create function to get recovery score
CREATE OR REPLACE FUNCTION calculate_recovery_score(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day'
)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 50; -- Baseline
  v_sleep_hours NUMERIC;
  v_avg_hr NUMERIC;
  v_steps INTEGER;
BEGIN
  -- Get daily summary
  SELECT
    sleep_hours,
    avg_heart_rate,
    total_steps
  INTO v_sleep_hours, v_avg_hr, v_steps
  FROM daily_activity_summary
  WHERE user_id = p_user_id
    AND activity_date = p_date;

  -- Sleep quality (30% weight)
  IF v_sleep_hours >= 7 AND v_sleep_hours <= 9 THEN
    v_score := v_score + 30;
  ELSIF v_sleep_hours >= 6 AND v_sleep_hours < 7 THEN
    v_score := v_score + 20;
  ELSIF v_sleep_hours >= 5 AND v_sleep_hours < 6 THEN
    v_score := v_score + 10;
  END IF;

  -- Heart rate (20% weight)
  IF v_avg_hr > 0 AND v_avg_hr < 60 THEN
    v_score := v_score + 20;
  ELSIF v_avg_hr >= 60 AND v_avg_hr < 70 THEN
    v_score := v_score + 15;
  ELSIF v_avg_hr >= 70 AND v_avg_hr < 80 THEN
    v_score := v_score + 10;
  END IF;

  -- Activity level
  IF v_steps >= 7000 AND v_steps <= 12000 THEN
    v_score := v_score + 10;
  ELSIF v_steps > 12000 THEN
    v_score := v_score - 10;
  END IF;

  RETURN GREATEST(0, LEAST(100, v_score));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION calculate_recovery_score TO authenticated;

-- Create function to get weekly trends
CREATE OR REPLACE FUNCTION get_weekly_trend(
  p_user_id UUID,
  p_data_type TEXT,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  date DATE,
  value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(start_date) as date,
    SUM(health_data.value) as value
  FROM health_data
  WHERE user_id = p_user_id
    AND data_type = p_data_type
    AND DATE(start_date) >= p_end_date - INTERVAL '6 days'
    AND DATE(start_date) <= p_end_date
  GROUP BY DATE(start_date)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_weekly_trend TO authenticated;

-- Create comments for documentation
COMMENT ON TABLE health_data IS 'Stores health data from various sources (HealthKit, Google Fit, manual entry) for rehabilitation insights and recovery tracking';
COMMENT ON TABLE health_data_sync_log IS 'Tracks synchronization events from external health data sources';
COMMENT ON TABLE health_data_preferences IS 'User preferences for health data collection and synchronization';
COMMENT ON VIEW daily_activity_summary IS 'Aggregated daily activity metrics for easy querying';
COMMENT ON FUNCTION calculate_recovery_score IS 'Calculates a recovery score (0-100) based on sleep, heart rate, and activity levels';
COMMENT ON FUNCTION get_weekly_trend IS 'Returns 7-day trend data for a specific health metric';
