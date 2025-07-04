-- IMPORTANT: This script requires creating users in Supabase Auth first
-- You cannot directly insert into auth.users table - it must be done through Supabase Auth

-- Step 1: Create users in Supabase Auth Dashboard or using Supabase client
-- Go to Authentication > Users in your Supabase dashboard and create these users:
-- 1. support@indexof.id (Super Admin)
-- 2. adminweb@bikinlagi.com (Admin Web)
-- 3. finance@bikinlagi.com (Finance)
-- 4. admin2@bikinlagi.com (Admin Web 2)
-- 5. finance2@bikinlagi.com (Finance 2)

-- Step 2: After creating users in Auth, get their UUIDs and update this script
-- Or use a different approach with email-based lookup

-- Alternative approach: Insert staff records using email lookup
-- This assumes the auth users already exist

-- Insert staff records (will fail if auth users don't exist)
DO $$
DECLARE
    super_admin_id UUID;
    admin_web_id UUID;
    finance_id UUID;
    admin2_id UUID;
    finance2_id UUID;
BEGIN
    -- Try to get user IDs from auth.users (this might not work in all Supabase setups)
    -- If this fails, you'll need to manually get the UUIDs from the Auth dashboard
    
    -- For now, let's use placeholder UUIDs that you'll need to replace
    -- with actual UUIDs from your Supabase Auth users
    
    -- Super Admin User
    INSERT INTO public.staff (
        id,
        email,
        name,
        role
    ) VALUES (
        'replace-with-actual-uuid-1'::UUID,
        'support@indexof.id',
        'Super Admin User',
        'super_admin'
    );

    -- Admin Web User
    INSERT INTO public.staff (
        id,
        email,
        name,
        role
    ) VALUES (
        'replace-with-actual-uuid-2'::UUID,
        'anggiadiputra@yahoo.com',
        'Admin Web User',
        'admin_web'
    );

    -- Finance User
    INSERT INTO public.staff (
        id,
        email,
        name,
        role
    ) VALUES (
        'replace-with-actual-uuid-3'::UUID,
        'no-reply@indexof.id',
        'Finance User',
        'finance'
    );

    -- Additional test users
    INSERT INTO public.staff (
        id,
        email,
        name,
        role
    ) VALUES (
        'replace-with-actual-uuid-4'::UUID,
        'admin2@bikinlagi.com',
        'Admin User 2',
        'admin_web'
    ),
    (
        'replace-with-actual-uuid-5'::UUID,
        'finance2@bikinlagi.com',
        'Finance User 2',
        'finance'
    );

    RAISE NOTICE 'Staff records inserted successfully';
END $$;

-- Insert some sample domains for testing
INSERT INTO public.domains (
    name,
    registrar,
    expiry_date,
    renewal_cost,
    status,
    whois_data
) VALUES 
(
    'example.com',
    'Namecheap',
    '2024-12-31',
    150000,
    'active',
    '{"registrant": "Example Corp", "created": "2020-01-01", "updated": "2024-01-01"}'::jsonb
),
(
    'testdomain.id',
    'Pandi',
    '2024-06-15',
    200000,
    'active',
    '{"registrant": "Test Company", "created": "2021-03-15", "updated": "2024-03-15"}'::jsonb
),
(
    'expiringsoon.com',
    'GoDaddy',
    CURRENT_DATE + INTERVAL '15 days',
    180000,
    'active',
    '{"registrant": "Expiring Corp", "created": "2019-05-10", "updated": "2024-05-10"}'::jsonb
);

-- Insert some sample hosting for testing
INSERT INTO public.hosting (
    provider,
    package,
    primary_domain,
    expiry_date,
    renewal_cost,
    status
) VALUES 
(
    'DigitalOcean',
    'Basic Droplet',
    'example.com',
    '2024-11-30',
    120000,
    'active'
),
(
    'AWS',
    'EC2 t3.micro',
    'testdomain.id',
    '2024-08-20',
    200000,
    'active'
);

-- Insert some sample VPS for testing
INSERT INTO public.vps (
    provider,
    ip_address,
    location,
    root_user,
    root_password,
    expiry_date,
    renewal_cost,
    status
) VALUES 
(
    'Vultr',
    '192.168.1.100',
    'Singapore',
    'root',
    'encrypted_password_1',
    '2024-10-15',
    300000,
    'active'
),
(
    'Linode',
    '10.0.0.50',
    'Tokyo',
    'root',
    'encrypted_password_2',
    CURRENT_DATE + INTERVAL '25 days',
    250000,
    'active'
);

-- Insert some sample websites for testing
INSERT INTO public.websites (
    domain,
    cms,
    ip_address,
    hosting_id,
    admin_username,
    admin_password,
    expiry_date,
    renewal_cost,
    status
) VALUES 
(
    'example.com',
    'WordPress',
    '192.168.1.100',
    (SELECT id FROM public.hosting WHERE provider = 'DigitalOcean' LIMIT 1),
    'admin',
    'encrypted_admin_password_1',
    '2024-12-31',
    500000,
    'active'
),
(
    'testdomain.id',
    'Custom CMS',
    '10.0.0.50',
    (SELECT id FROM public.hosting WHERE provider = 'AWS' LIMIT 1),
    'administrator',
    'encrypted_admin_password_2',
    '2024-09-30',
    400000,
    'active'
); 