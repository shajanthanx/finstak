-- Migration: Remove goal_target from habits table
-- ============================================================================

-- 1. Drop the goal_target column
ALTER TABLE habits 
DROP COLUMN IF EXISTS goal_target;
