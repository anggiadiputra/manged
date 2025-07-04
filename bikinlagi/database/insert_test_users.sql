-- Insert test users with different roles
-- Note: These are sample users for testing purposes
-- In production, users should be created through Supabase Auth

-- Super Admin User
INSERT INTO public.staff (
    id,
    email,
    name,
    role
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
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
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'adminweb@bikinlagi.com',
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
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'finance@bikinlagi.com',
    'Finance User',
    'finance'
);

-- Additional test users for each role
INSERT INTO public.staff (
    id,
    email,
    name,
    role
) VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'admin2@bikinlagi.com',
    'Admin User 2',
    'admin_web'
),
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'finance2@bikinlagi.com',
    'Finance User 2',
    'finance'
);

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