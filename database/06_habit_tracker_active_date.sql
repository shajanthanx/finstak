-- Migration: Add active_from_date to habits table
-- ============================================================================

-- 1. Add the new column with a default value of CURRENT_DATE
ALTER TABLE habits 
ADD COLUMN active_from_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- 2. Update existing records to have active_from_date match their start_date
-- This ensures that for existing habits, the behavior remains consistent (active from the start)
UPDATE habits 
SET active_from_date = start_date;

-- 3. (Optional) Create an index if you plan to query/filter by this column frequently
CREATE INDEX idx_habits_active_from_date ON habits(active_from_date);
