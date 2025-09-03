# Environment Setup Guide

## Quick Fix for "fetch failed" Error

The error you're seeing is because the Supabase environment variables are not configured. Here's how to fix it:

### 1. Create Environment File

Create a file named `.env.local` in the root directory of your project with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select an existing one
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key
5. Replace the placeholder values in your `.env.local` file

### 3. Set Up Your Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `database/schema.sql`
3. Run the SQL to create your database tables

### 4. Restart Your Development Server

```bash
npm run dev
```

### 5. Verify Setup

Visit http://localhost:3000 and the error should be resolved. You should see your restaurant homepage with proper data loading.

## Troubleshooting

- Make sure the `.env.local` file is in the root directory (same level as `package.json`)
- Don't commit `.env.local` to version control (it should be in `.gitignore`)
- Restart your development server after creating the environment file
- Check the browser console for any remaining errors

## Next Steps

Once the basic setup is working:
- Add your restaurant's actual menu items to the database
- Customize the website content and styling
- Set up the admin dashboard for managing content
