-- FinStack Database Schema Update - Task Categories

-- Table: task_categories
-- User-defined categories for tasks (projects)
CREATE TABLE task_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  icon TEXT DEFAULT 'file-text',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

CREATE INDEX idx_task_categories_user_id ON task_categories(user_id);

CREATE TRIGGER update_task_categories_updated_at
  BEFORE UPDATE ON task_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Modify Table: tasks
-- Add category_id foreign key
ALTER TABLE tasks 
ADD COLUMN category_id UUID REFERENCES task_categories(id) ON DELETE SET NULL;

CREATE INDEX idx_tasks_category_id ON tasks(category_id);

-- Optional: If you want to migrate existing 'category' text column to 'category_id'
-- You would need to insert distinct categories into task_categories first and then update tasks.
-- Since the user requested manual assignment, we leave it as nullable and empty for old tasks.
