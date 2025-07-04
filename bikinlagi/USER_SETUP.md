# User Setup Guide

This guide will help you create the 3 test users with passwords for your Digital Asset Management Dashboard.

## 📋 Users to be Created

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Super Admin | `support@indexof.id` | `SuperAdmin123!` | Full access to everything |
| Admin Web | `anggiadiputra@yahoo.com` | `AdminWeb123!` | CRUD access (except staff) |
| Finance | `no-reply@indexof.id` | `Finance123!` | Read-only + whois updates |

## 🚀 Quick Setup

### Step 1: Set up Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### Step 2: Get Your Supabase Keys

1. Go to your Supabase Dashboard
2. Navigate to **Settings > API**
3. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Create Users

Run the user creation script:
```bash
npm run create-users
```

This will:
- ✅ Create users in Supabase Auth
- ✅ Insert staff records in your database
- ✅ Set up proper role permissions
- ✅ Display login credentials

## 🔐 Login Credentials

After running the script, you can login with:

### Super Admin
- **Email:** `support@indexof.id`
- **Password:** `SuperAdmin123!`
- **Access:** Full system access

### Admin Web
- **Email:** `anggiadiputra@yahoo.com`
- **Password:** `AdminWeb123!`
- **Access:** Manage domains, hosting, VPS, websites

### Finance
- **Email:** `no-reply@indexof.id`
- **Password:** `Finance123!`
- **Access:** View all data + update whois info

## 🛠️ Manual Setup (Alternative)

If the script doesn't work, you can create users manually:

### Option 1: Supabase Dashboard
1. Go to **Authentication > Users**
2. Click **"Add user"**
3. Enter email and password
4. After creation, note the user UUID
5. Insert staff record using the UUID

### Option 2: SQL Commands
```sql
-- After creating auth users, insert staff records:
INSERT INTO public.staff (id, email, name, role) VALUES 
('user-uuid-1', 'support@indexof.id', 'Super Admin User', 'super_admin'),
('user-uuid-2', 'anggiadiputra@yahoo.com', 'Admin Web User', 'admin_web'),
('user-uuid-3', 'no-reply@indexof.id', 'Finance User', 'finance');
```

## 🎯 Testing the Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit:** http://localhost:3000

3. **Login with any of the test accounts**

4. **Test role permissions:**
   - Super Admin: Can access Staff Management
   - Admin Web: Cannot access Staff Management
   - Finance: Read-only access with whois update capability

## 🔧 Troubleshooting

### Error: "User already exists"
- The user might already exist in Supabase Auth
- Check Authentication > Users in your dashboard
- Delete existing users if needed

### Error: "Invalid service role key"
- Make sure you're using the `service_role` key, not the `anon` key
- The service role key is longer and starts with `eyJhbGciOiJIUzI1NiIs...`

### Error: "Foreign key constraint violation"
- Make sure the database schema is properly set up
- Run `database/schema.sql` first
- Ensure RLS policies are enabled

## 📝 Notes

- Passwords follow strong password requirements
- Users are auto-confirmed (no email verification needed)
- All users have proper role-based access control
- You can change passwords later in Supabase Dashboard

## 🔄 Updating Passwords

To change passwords later:
1. Go to Supabase Dashboard
2. Navigate to **Authentication > Users**
3. Click on a user
4. Click **"Reset Password"** or **"Update User"** 