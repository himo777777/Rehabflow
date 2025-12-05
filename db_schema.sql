-- RehabFlow Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for premium status tracking)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'trial', 'active', 'cancelled')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT
);

-- Programs table (stores generated rehab programs)
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  program_data JSONB NOT NULL,
  assessment_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress table (tracks daily exercise completion)
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  exercises JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_programs_user_id ON programs(user_id);
CREATE INDEX IF NOT EXISTS idx_programs_updated_at ON programs(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_date ON progress(date DESC);
CREATE INDEX IF NOT EXISTS idx_progress_user_date ON progress(user_id, date);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
-- Note: Since we use anonymous users with localStorage IDs,
-- we match user_id from the request context

-- For users table: allow insert and select for matching UUID
-- SECURITY FIX: Properly restrict access to own data only
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- For programs table - restrict to own data
CREATE POLICY "Users can view own programs" ON programs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own programs" ON programs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own programs" ON programs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own programs" ON programs
  FOR DELETE USING (auth.uid() = user_id);

-- For progress table - restrict to own data
CREATE POLICY "Users can view own progress" ON progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON progress
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update timestamps
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FAS 6: NYA TABELLER FÖR FUNKTIONALITET
-- ============================================

-- Pain logs table (stores pre/post workout check-ins)
CREATE TABLE IF NOT EXISTS pain_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  log_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Exercise logs table (detailed exercise tracking)
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  exercise_name TEXT NOT NULL,
  log_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, exercise_name)
);

-- Milestones table (achievements/badges)
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  milestone_type TEXT NOT NULL,
  milestone_data JSONB NOT NULL DEFAULT '{}',
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_pain_logs_user_id ON pain_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_pain_logs_date ON pain_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_pain_logs_user_date ON pain_logs(user_id, date);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_id ON exercise_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_date ON exercise_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date ON exercise_logs(user_id, date);

CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_type ON milestones(milestone_type);

-- Enable RLS on new tables
ALTER TABLE pain_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pain_logs - SECURITY FIX: restrict to own data
CREATE POLICY "Users can view own pain_logs" ON pain_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pain_logs" ON pain_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pain_logs" ON pain_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pain_logs" ON pain_logs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for exercise_logs - SECURITY FIX: restrict to own data
CREATE POLICY "Users can view own exercise_logs" ON exercise_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise_logs" ON exercise_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise_logs" ON exercise_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise_logs" ON exercise_logs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for milestones - SECURITY FIX: restrict to own data
CREATE POLICY "Users can view own milestones" ON milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones" ON milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers for auto-update timestamps
CREATE TRIGGER update_pain_logs_updated_at
  BEFORE UPDATE ON pain_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_logs_updated_at
  BEFORE UPDATE ON exercise_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
