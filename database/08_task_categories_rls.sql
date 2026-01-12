-- Enable RLS
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;
-- Policies for task_categories
CREATE POLICY "Users can view own task categories"
  ON task_categories FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own task categories"
  ON task_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own task categories"
  ON task_categories FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own task categories"
  ON task_categories FOR DELETE
  USING (auth.uid() = user_id);