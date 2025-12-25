# Environment Variables Setup Guide

## ⚠️ Error Fix: Missing Environment Variables

If you're seeing the error:
```
Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
```

This means your Supabase environment variables are not set up correctly.

## 📝 Quick Setup

### Step 1: Create `.env.local` file

Create a file named `.env.local` in the root of your project (same directory as `package.json`).

### Step 2: Get your Supabase credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 3: Add to `.env.local`

Create `.env.local` with this content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Replace `your-project-id` and `your-anon-key-here` with your actual values!

### Step 4: Restart your dev server

After creating/updating `.env.local`:

1. Stop your dev server (Ctrl+C)
2. Start it again: `npm run dev`

## ✅ Verify Setup

Your `.env.local` file should look like this (with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.example-key-here
```

## 🔍 Troubleshooting

### Error persists after setup?

1. **Check file name**: Must be exactly `.env.local` (not `.env.local.txt` or `.env`)
2. **Check location**: File must be in project root (same folder as `package.json`)
3. **Check format**: No spaces around `=`, no quotes needed
4. **Restart server**: Always restart after changing `.env.local`
5. **Check values**: Make sure URL starts with `https://` and key is the full anon key

### Still having issues?

1. Check console for specific error messages
2. Verify your Supabase project is active
3. Make sure you copied the full anon key (it's very long)
4. Ensure the URL doesn't have trailing slashes

## 📚 Additional Resources

- [Supabase Getting Started](https://supabase.com/docs/guides/getting-started)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

