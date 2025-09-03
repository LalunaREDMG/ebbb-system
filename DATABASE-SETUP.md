# Database Setup Instructions

## Quick Database Setup

Since you have the environment variables configured correctly, the issue is likely that your Supabase database doesn't have the required tables yet.

### Step 1: Set Up Your Database

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `uriqvmquwogjdagoorjq`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Database Schema**
   - Copy the entire contents of `database/schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the SQL

### Step 2: Verify Setup

After running the schema, you should have:
- ✅ All required tables created (products, announcements, reservations, etc.)
- ✅ Sample data inserted
- ✅ Row Level Security policies configured
- ✅ Default admin user created (username: `admin`, password: `admin123`)

### Step 3: Test the Application

Once the database is set up:
1. Refresh your browser at http://localhost:3000
2. The error message should disappear
3. You should see the restaurant homepage with sample menu items and announcements

### Troubleshooting

If you still see the error after setting up the database:
1. Check the browser console for specific error messages
2. Verify the SQL executed successfully in Supabase
3. Make sure your environment variables are correct
4. Restart the development server: `npm run dev`

## Sample Data Included

The schema includes:
- 5 sample menu items (burger, fish & chips, salad, beer, brownie)
- 3 sample announcements (grand opening, new menu, weekend special)
- Default admin user for the admin dashboard
