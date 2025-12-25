-- FinStack Database Functions
-- This script creates database functions for automation
-- Run this AFTER 01_schema.sql

-- ============================================================================
-- USER INITIALIZATION FUNCTIONS
-- ============================================================================

-- Function: handle_new_user
-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function: initialize_default_categories
-- Create default categories for a new user
CREATE OR REPLACE FUNCTION initialize_default_categories(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO categories (user_id, name, type, icon, color, budgeting_enabled)
  VALUES
    -- Expense categories
    (p_user_id, 'Food', 'expense', '🍔', '#52525b', true),
    (p_user_id, 'Transport', 'expense', '🚗', '#a1a1aa', true),
    (p_user_id, 'Entertainment', 'expense', '🎬', '#e4e4e7', true),
    (p_user_id, 'Utilities', 'expense', '⚡', '#fbbf24', true),
    (p_user_id, 'Shopping', 'expense', '🛍️', '#8b5cf6', true),
    (p_user_id, 'Housing', 'expense', '🏠', '#18181b', true),
    (p_user_id, 'Healthcare', 'expense', '🏥', '#ef4444', true),
    (p_user_id, 'Education', 'expense', '📚', '#3b82f6', true),
    (p_user_id, 'Bills', 'expense', '📄', '#10b981', true),
    (p_user_id, 'Other', 'expense', '📦', '#6b7280', true),
    -- Income categories
    (p_user_id, 'Salary', 'income', '💼', '#059669', false),
    (p_user_id, 'Freelance', 'income', '💻', '#0d9488', false),
    (p_user_id, 'Investment', 'income', '📈', '#14b8a6', false),
    (p_user_id, 'Other Income', 'income', '💰', '#2dd4bf', false)
  ON CONFLICT (user_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function: initialize_default_budgets
-- Create default budgets for a new user
CREATE OR REPLACE FUNCTION initialize_default_budgets(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO budgets (user_id, category, budget_limit, color)
  VALUES
    (p_user_id, 'Food', 800, '#52525b'),
    (p_user_id, 'Transport', 300, '#a1a1aa'),
    (p_user_id, 'Entertainment', 200, '#e4e4e7'),
    (p_user_id, 'Utilities', 250, '#fbbf24'),
    (p_user_id, 'Shopping', 400, '#8b5cf6'),
    (p_user_id, 'Housing', 2000, '#18181b'),
    (p_user_id, 'Healthcare', 500, '#ef4444'),
    (p_user_id, 'Education', 300, '#3b82f6'),
    (p_user_id, 'Bills', 150, '#10b981'),
    (p_user_id, 'Other', 200, '#6b7280')
  ON CONFLICT (user_id, category) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ANALYTICS FUNCTIONS
-- ============================================================================

-- Function: calculate_monthly_trends
-- Calculate income, expense, and savings for a date range
CREATE OR REPLACE FUNCTION calculate_monthly_trends(
  p_user_id UUID,
  p_start_month DATE,
  p_end_month DATE
)
RETURNS TABLE(
  month DATE,
  income DECIMAL,
  expense DECIMAL,
  savings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC('month', t.date)::DATE as month,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as expense,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) as savings
  FROM transactions t
  WHERE t.user_id = p_user_id
    AND t.date >= p_start_month
    AND t.date < p_end_month + INTERVAL '1 month'
  GROUP BY DATE_TRUNC('month', t.date)
  ORDER BY month DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: get_budget_status
-- Get budget status with spent amounts for all categories
CREATE OR REPLACE FUNCTION get_budget_status(p_user_id UUID)
RETURNS TABLE(
  category TEXT,
  budget_limit DECIMAL,
  spent DECIMAL,
  remaining DECIMAL,
  percent DECIMAL,
  color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.category,
    b.budget_limit as budget_limit,
    COALESCE(SUM(t.amount), 0) as spent,
    b.budget_limit - COALESCE(SUM(t.amount), 0) as remaining,
    CASE 
      WHEN b.budget_limit > 0 THEN ROUND((COALESCE(SUM(t.amount), 0) / b.budget_limit * 100)::numeric, 1)
      ELSE 0
    END as percent,
    b.color
  FROM budgets b
  LEFT JOIN transactions t ON 
    t.user_id = b.user_id 
    AND t.category = b.category 
    AND t.type = 'expense'
    AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
  WHERE b.user_id = p_user_id
  GROUP BY b.category, b.budget_limit, b.color
  ORDER BY b.category;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- List all functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'handle_new_user',
    'initialize_default_categories',
    'initialize_default_budgets',
    'calculate_monthly_trends',
    'get_budget_status'
  )
ORDER BY routine_name;
