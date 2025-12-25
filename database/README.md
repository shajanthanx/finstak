# FinStack Database Setup

This directory contains SQL scripts to set up the FinStack database in Supabase.

## Database Schema Overview

The database consists of **7 tables**:

1. **profiles** - User profile information
2. **categories** - User-defined transaction categories
3. **transactions** - Financial transactions (income/expenses)
4. **budgets** - Budget limits per category
5. **installments** - Payment plan tracking
6. **tasks** - Task management
7. **subtasks** - Subtasks for tasks

## Setup Instructions

### Step 1: Run Schema Script

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `01_schema.sql`
5. Click **Run** to execute

This will create all tables with proper indexes and constraints.

### Step 2: Run Functions Script

1. In SQL Editor, create a new query
2. Copy and paste the contents of `02_functions.sql`
3. Click **Run** to execute

This will create:
- User initialization functions
- Analytics calculation functions
- Auto-trigger for profile creation

### Step 3: Run RLS Policies Script

1. In SQL Editor, create a new query
2. Copy and paste the contents of `03_rls_policies.sql`
3. Click **Run** to execute

This will:
- Enable Row Level Security on all tables
- Create policies to ensure users can only access their own data

### Step 4: Verify Setup

Run this query to verify everything is set up correctly:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check functions
SELECT routine_name 
FROM information_schema.routines
WHERE routine_schema = 'public';
```

You should see:
- 7 tables
- All tables with RLS enabled
- 5 functions

## What Happens on User Signup

When a new user signs up:

1. **Profile Auto-Created**: The `handle_new_user()` trigger automatically creates a profile entry
2. **Empty Database**: User starts with completely empty database (no mock data)
3. **Setup Flow**: User must run the setup to initialize:
   - Default categories (14 categories: 10 expense + 4 income)
   - Default budgets (10 budgets with preset limits)

## Default Categories

### Expense Categories (10)
- Food 🍔
- Transport 🚗
- Entertainment 🎬
- Utilities ⚡
- Shopping 🛍️
- Housing 🏠
- Healthcare 🏥
- Education 📚
- Bills 📄
- Other 📦

### Income Categories (4)
- Salary 💼
- Freelance 💻
- Investment 📈
- Other Income 💰

## Default Budget Limits

| Category | Default Limit |
|----------|--------------|
| Food | $800 |
| Transport | $300 |
| Entertainment | $200 |
| Utilities | $250 |
| Shopping | $400 |
| Housing | $2,000 |
| Healthcare | $500 |
| Education | $300 |
| Bills | $150 |
| Other | $200 |

## Security

All tables have Row Level Security (RLS) enabled. Users can only:
- View their own data
- Insert data with their own user_id
- Update their own data
- Delete their own data

Subtasks inherit permissions from their parent task.

## Database Functions

### User Initialization
- `handle_new_user()` - Auto-creates profile on signup
- `initialize_default_categories(user_id)` - Creates default categories
- `initialize_default_budgets(user_id)` - Creates default budgets

### Analytics
- `calculate_monthly_trends(user_id, start_month, end_month)` - Calculate monthly income/expense/savings
- `get_budget_status(user_id)` - Get budget status with spent amounts

## Troubleshooting

### RLS Policy Issues
If users can't access their data:
1. Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
2. Check policies exist: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
3. Verify user is authenticated: `SELECT auth.uid();`

### Profile Not Created
If profile isn't auto-created on signup:
1. Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
2. Manually create profile: `INSERT INTO profiles (id, email) VALUES (auth.uid(), 'user@example.com');`

### Function Errors
If functions fail:
1. Check function exists: `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';`
2. Check function permissions
3. Review Supabase logs for errors

## Next Steps

After database setup is complete:
1. Update API routes to use Supabase
2. Generate TypeScript types
3. Test authentication flow
4. Test data isolation between users
