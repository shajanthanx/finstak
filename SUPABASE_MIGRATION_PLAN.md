# Supabase Migration Plan: From Mock Backend to Real Backend

## Table of Contents
1. [Current Setup Analysis](#current-setup-analysis)
2. [Target Architecture](#target-architecture)
3. [Phase 1: Authentication Implementation](#phase-1-authentication-implementation)
4. [Phase 2: Database Schema & Integration](#phase-2-database-schema--integration)
5. [Best Practices & Potential Pitfalls](#best-practices--potential-pitfalls)
6. [Migration Checklist](#migration-checklist)

---

## Current Setup Analysis

### Existing Architecture

**Technology Stack:**
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Data Fetching:** React Query (@tanstack/react-query)
- **Styling:** Tailwind CSS
- **Current Backend:** File-based JSON storage (`src/data/db.json`)

**Current Data Models:**
1. **Transactions** - Financial income/expense records
2. **Budgets** - Category-based spending limits
3. **Installments** - Payment plans/tracking
4. **Tasks** - Task management with subtasks
5. **Recurring Bills** - Recurring payment tracking
6. **Monthly Trends** - Historical financial trends

**Current API Structure:**
- `/api/transactions` - GET, POST
- `/api/transactions/[id]` - DELETE
- `/api/budgets` - GET, PUT
- `/api/installments` - GET, POST
- `/api/tasks` - GET, POST
- `/api/tasks/[id]` - PUT, DELETE
- `/api/stats` - GET (with query params for different stat types)

**Current Limitations:**
- ❌ No user authentication/authorization
- ❌ No data isolation between users
- ❌ File-based storage (not scalable, not production-ready)
- ❌ No real-time capabilities
- ❌ No data validation at database level
- ❌ No relationships/foreign keys
- ❌ Data persistence only in development (file system)

---

## Target Architecture

### Supabase Integration

**What Supabase Provides:**
- ✅ PostgreSQL database (production-ready)
- ✅ Built-in authentication (email/password, OAuth, magic links)
- ✅ Row Level Security (RLS) for data isolation
- ✅ Real-time subscriptions
- ✅ Auto-generated REST API
- ✅ Type-safe client libraries
- ✅ Storage for files (if needed later)

**New Architecture:**
```
Frontend (Next.js)
    ↓
Supabase Client (Browser)
    ↓
Supabase API (REST/PostgREST)
    ↓
PostgreSQL Database (with RLS)
```

---

## Phase 1: Authentication Implementation

### Step 1.1: Install Supabase Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Step 1.2: Set Up Supabase Project

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon/public key from Settings → API
4. Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (keep secret, server-side only)
```

### Step 1.3: Create Supabase Client Utilities

**File: `src/lib/supabase/client.ts`**
- Browser-side Supabase client
- Used in client components

**File: `src/lib/supabase/server.ts`**
- Server-side Supabase client
- Used in API routes and server components

**File: `src/lib/supabase/middleware.ts`**
- Middleware helper for route protection

### Step 1.4: Create Authentication Pages

**File: `src/app/auth/login/page.tsx`**
- Login form (email + password)
- Link to signup page
- Error handling

**File: `src/app/auth/signup/page.tsx`**
- Signup form (email + password + confirm password)
- Link to login page
- Error handling

**File: `src/app/auth/callback/route.ts`**
- Handles OAuth callbacks (if using OAuth providers)

### Step 1.5: Create Auth Context/Provider

**File: `src/providers/AuthProvider.tsx`**
- React context for auth state
- Provides: `user`, `session`, `signIn`, `signOut`, `signUp`
- Uses React Query for state management

### Step 1.6: Protect Routes with Middleware

**File: `src/middleware.ts`**
- Protect authenticated routes
- Redirect unauthenticated users to `/auth/login`
- Allow public routes (auth pages, etc.)

### Step 1.7: Update Layout Components

- Add logout button to Header/Sidebar
- Show user email/avatar when authenticated
- Hide protected routes when not authenticated

### Step 1.8: Test Authentication Flow

- ✅ Sign up new user
- ✅ Login with credentials
- ✅ Logout
- ✅ Protected route access
- ✅ Session persistence

---

## Phase 2: Database Schema & Integration

### Step 2.1: Design Database Schema

#### Core Tables

**1. `profiles` (extends Supabase auth.users)**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**2. `transactions`**
```sql
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category);
```

**3. `budgets`**
```sql
CREATE TABLE budgets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  limit DECIMAL(10, 2) NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
```

**4. `installments`**
```sql
CREATE TABLE installments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  total_months INTEGER NOT NULL,
  paid_months INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_installments_user_id ON installments(user_id);
```

**5. `tasks`**
```sql
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'done')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

**6. `subtasks`**
```sql
CREATE TABLE subtasks (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subtasks_task_id ON subtasks(task_id);
```

**7. `recurring_bills`**
```sql
CREATE TABLE recurring_bills (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recurring_bills_user_id ON recurring_bills(user_id);
```

**8. `monthly_trends` (Optional - can be computed)**
```sql
CREATE TABLE monthly_trends (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of month
  income DECIMAL(10, 2) DEFAULT 0,
  expense DECIMAL(10, 2) DEFAULT 0,
  savings DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

CREATE INDEX idx_monthly_trends_user_id ON monthly_trends(user_id);
CREATE INDEX idx_monthly_trends_month ON monthly_trends(month);
```

### Step 2.2: Set Up Row Level Security (RLS)

**Enable RLS on all tables:**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_trends ENABLE ROW LEVEL SECURITY;
```

**Create RLS Policies (Users can only access their own data):**

```sql
-- Profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Repeat similar policies for budgets, installments, tasks, etc.
```

### Step 2.3: Create Database Functions (Optional but Recommended)

**Function to auto-create profile on signup:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Function to calculate monthly trends:**
```sql
CREATE OR REPLACE FUNCTION calculate_monthly_trends(p_user_id UUID, p_month DATE)
RETURNS TABLE(income DECIMAL, expense DECIMAL, savings DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as savings
  FROM transactions
  WHERE user_id = p_user_id
    AND DATE_TRUNC('month', date) = DATE_TRUNC('month', p_month);
END;
$$ LANGUAGE plpgsql;
```

### Step 2.4: Create Supabase Service Layer

**File: `src/lib/supabase/queries.ts`**
- Type-safe query functions
- Wrappers around Supabase client calls
- Error handling

**File: `src/lib/supabase/types.ts`**
- TypeScript types generated from database schema
- Can use `supabase gen types typescript` command

### Step 2.5: Replace API Routes

**Update each API route to use Supabase:**

**Example: `src/app/api/transactions/route.ts`**
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...body, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

**Repeat for all API routes:**
- `/api/budgets/route.ts`
- `/api/installments/route.ts`
- `/api/tasks/route.ts`
- `/api/tasks/[id]/route.ts`
- `/api/stats/route.ts`

### Step 2.6: Update Frontend Service Layer

**File: `src/services/api.ts`**
- Keep the same interface
- Update to include auth headers if needed
- Supabase client handles auth automatically in browser

**Alternative: Use Supabase Client Directly**
- Consider using Supabase client directly in components
- Skip API routes for simple CRUD operations
- Use API routes only for complex business logic

### Step 2.7: Data Migration Script

**File: `scripts/migrate-data.ts`**
- Script to migrate existing `db.json` data to Supabase
- Map data to new schema
- Assign to a test user or admin user
- Run once before going live

### Step 2.8: Update Types

**File: `src/types/index.ts`**
- Add `user_id` to all relevant types
- Update types to match database schema
- Ensure consistency

---

## Best Practices & Potential Pitfalls

### Best Practices

1. **Environment Variables**
   - ✅ Never commit `.env.local` to git
   - ✅ Use different Supabase projects for dev/staging/prod
   - ✅ Use service role key only on server-side

2. **Security**
   - ✅ Always enable RLS on all tables
   - ✅ Never trust client-side data validation
   - ✅ Use Supabase's built-in validation where possible
   - ✅ Sanitize user inputs

3. **Performance**
   - ✅ Use database indexes (already included in schema)
   - ✅ Implement pagination for large datasets
   - ✅ Use React Query caching effectively
   - ✅ Consider using Supabase real-time subscriptions for live updates

4. **Error Handling**
   - ✅ Handle network errors gracefully
   - ✅ Show user-friendly error messages
   - ✅ Log errors for debugging
   - ✅ Handle auth token expiration

5. **Type Safety**
   - ✅ Generate TypeScript types from database schema
   - ✅ Use strict TypeScript settings
   - ✅ Validate data at runtime when needed

6. **Testing**
   - ✅ Test authentication flows thoroughly
   - ✅ Test RLS policies
   - ✅ Test error scenarios
   - ✅ Test data migration script

### Potential Pitfalls

1. **RLS Policies**
   - ⚠️ Forgetting to enable RLS (data exposed to all users)
   - ⚠️ Incorrect policy logic (users can't access their data)
   - ⚠️ Not testing policies with different users

2. **Authentication State**
   - ⚠️ Race conditions between auth check and data fetch
   - ⚠️ Not handling session refresh properly
   - ⚠️ Stale auth state in React Query cache

3. **Database Schema**
   - ⚠️ Missing foreign key constraints
   - ⚠️ Not handling cascading deletes properly
   - ⚠️ Missing indexes causing slow queries

4. **Migration**
   - ⚠️ Data loss during migration
   - ⚠️ Not backing up data before migration
   - ⚠️ Not testing migration script thoroughly

5. **Type Mismatches**
   - ⚠️ Database types not matching TypeScript types
   - ⚠️ Date/timezone handling issues
   - ⚠️ Decimal precision issues with money

6. **API Routes vs Direct Client**
   - ⚠️ Unnecessary API routes when direct client access works
   - ⚠️ Missing server-side validation in API routes
   - ⚠️ Not handling errors consistently

---

## Migration Checklist

### Pre-Migration
- [ ] Create Supabase account and project
- [ ] Set up environment variables
- [ ] Backup current `db.json` file
- [ ] Document current data structure

### Phase 1: Authentication
- [ ] Install Supabase dependencies
- [ ] Create Supabase client utilities
- [ ] Create login page
- [ ] Create signup page
- [ ] Create auth provider/context
- [ ] Set up middleware for route protection
- [ ] Update layout components with auth UI
- [ ] Test authentication flow end-to-end

### Phase 2: Database Setup
- [ ] Create database schema in Supabase SQL editor
- [ ] Set up RLS policies
- [ ] Create database functions (if needed)
- [ ] Generate TypeScript types from schema
- [ ] Test RLS policies with multiple users

### Phase 3: API Migration
- [ ] Update `/api/transactions` routes
- [ ] Update `/api/budgets` routes
- [ ] Update `/api/installments` routes
- [ ] Update `/api/tasks` routes
- [ ] Update `/api/stats` route
- [ ] Test all API endpoints

### Phase 4: Frontend Updates
- [ ] Update service layer (`src/services/api.ts`)
- [ ] Update types (`src/types/index.ts`)
- [ ] Update components to handle auth state
- [ ] Add loading states for auth
- [ ] Add error handling for auth failures

### Phase 5: Data Migration
- [ ] Create migration script
- [ ] Test migration script with sample data
- [ ] Run migration script
- [ ] Verify data integrity
- [ ] Test with migrated data

### Phase 6: Cleanup
- [ ] Remove `src/lib/db.ts` (file-based DB)
- [ ] Remove `src/data/db.json` (or keep as backup)
- [ ] Remove mock data files if not needed
- [ ] Update documentation
- [ ] Remove unused dependencies

### Post-Migration
- [ ] Test all features thoroughly
- [ ] Monitor Supabase dashboard for errors
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Document new architecture
- [ ] Train team on Supabase usage

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase TypeScript Types](https://supabase.com/docs/reference/javascript/typescript-support)

---

## Estimated Timeline

- **Phase 1 (Authentication):** 2-3 days
- **Phase 2 (Database Setup):** 1-2 days
- **Phase 3 (API Migration):** 2-3 days
- **Phase 4 (Frontend Updates):** 1-2 days
- **Phase 5 (Data Migration):** 1 day
- **Phase 6 (Cleanup & Testing):** 1-2 days

**Total: 8-13 days** (depending on complexity and testing)

---

## Next Steps

1. Review this plan with your team
2. Set up Supabase project
3. Start with Phase 1 (Authentication)
4. Test thoroughly at each phase
5. Deploy incrementally if possible

Good luck with your migration! 🚀

