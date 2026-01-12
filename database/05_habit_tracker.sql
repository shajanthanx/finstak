-- Habit Tracker System
-- ============================================================================

-- Table: habits
-- Stores the habit definitions
CREATE TABLE habits (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📝',
  color TEXT DEFAULT '#3b82f6', -- Blue-500 default
  -- start_date allows users to backdate habits or start them in the future
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- archived_at allows stopping a habit without losing history
  archived_at TIMESTAMPTZ, 
  -- frequency: 'daily' is default. Could be 'weekly', 'weekdays', etc. in future
  frequency TEXT NOT NULL DEFAULT 'daily', 
  -- goal_target: Number of times to complete per day (default 1 for simple boolean check)
  goal_target INTEGER NOT NULL DEFAULT 1 CHECK (goal_target > 0),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_start_date ON habits(start_date);
CREATE INDEX idx_habits_archived_at ON habits(archived_at);

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Table: habit_logs
-- Stores the daily completion records
CREATE TABLE habit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id BIGINT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  -- completed_value: How much was done. If >= habit.goal_target, it's "done".
  completed_value INTEGER NOT NULL DEFAULT 1 CHECK (completed_value >= 0),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure only one log entry per habit per day
  UNIQUE(habit_id, date)
);

CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(date);
CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, date);

CREATE TRIGGER update_habit_logs_updated_at
  BEFORE UPDATE ON habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Enable Row Level Security (RLS)
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habits
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for habit_logs
CREATE POLICY "Users can view their own habit logs"
  ON habit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit logs"
  ON habit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs"
  ON habit_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs"
  ON habit_logs FOR DELETE
  USING (auth.uid() = user_id);
