-- Insert sample data for testing
-- This script only inserts domains, hosting, VPS, and websites
-- Staff users must be created through Supabase Auth first

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
),
(
    'bikinlagi.com',
    'Cloudflare',
    '2024-11-20',
    175000,
    'active',
    '{"registrant": "Bikin Lagi Corp", "created": "2022-01-01", "updated": "2024-01-01"}'::jsonb
),
(
    'indexof.id',
    'Pandi',
    CURRENT_DATE + INTERVAL '45 days',
    220000,
    'active',
    '{"registrant": "Index Of Indonesia", "created": "2021-06-01", "updated": "2024-06-01"}'::jsonb
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
),
(
    'Vultr',
    'High Frequency Compute',
    'bikinlagi.com',
    '2024-10-10',
    180000,
    'active'
),
(
    'Linode',
    'Shared CPU',
    'indexof.id',
    CURRENT_DATE + INTERVAL '20 days',
    150000,
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
),
(
    'DigitalOcean',
    '172.16.0.10',
    'New York',
    'admin',
    'encrypted_password_3',
    '2024-09-30',
    280000,
    'active'
),
(
    'AWS',
    '203.0.113.25',
    'Sydney',
    'ec2-user',
    'encrypted_password_4',
    CURRENT_DATE + INTERVAL '35 days',
    320000,
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
),
(
    'bikinlagi.com',
    'Next.js',
    '172.16.0.10',
    (SELECT id FROM public.hosting WHERE provider = 'Vultr' LIMIT 1),
    'webmaster',
    'encrypted_admin_password_3',
    '2024-11-20',
    600000,
    'active'
),
(
    'indexof.id',
    'Laravel',
    '203.0.113.25',
    (SELECT id FROM public.hosting WHERE provider = 'Linode' LIMIT 1),
    'sysadmin',
    'encrypted_admin_password_4',
    CURRENT_DATE + INTERVAL '40 days',
    450000,
    'active'
);

-- Create some domain-hosting relationships
INSERT INTO public.domain_hosting (domain_id, hosting_id)
SELECT d.id, h.id 
FROM public.domains d, public.hosting h 
WHERE (d.name = 'example.com' AND h.provider = 'DigitalOcean')
   OR (d.name = 'testdomain.id' AND h.provider = 'AWS')
   OR (d.name = 'bikinlagi.com' AND h.provider = 'Vultr')
   OR (d.name = 'indexof.id' AND h.provider = 'Linode');

-- Display summary of inserted data
DO $$
BEGIN
    RAISE NOTICE 'Sample data inserted successfully:';
    RAISE NOTICE '- Domains: %', (SELECT COUNT(*) FROM public.domains);
    RAISE NOTICE '- Hosting: %', (SELECT COUNT(*) FROM public.hosting);
    RAISE NOTICE '- VPS: %', (SELECT COUNT(*) FROM public.vps);
    RAISE NOTICE '- Websites: %', (SELECT COUNT(*) FROM public.websites);
    RAISE NOTICE '- Domain-Hosting relationships: %', (SELECT COUNT(*) FROM public.domain_hosting);
END $$; 