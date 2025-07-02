-- Step 1: Drop existing domains table
DROP TABLE IF EXISTS public.domains;

-- Step 2: Create domains table with new structure
CREATE TABLE IF NOT EXISTS public.domains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    renewal_price DECIMAL(10,2) NOT NULL DEFAULT '0.00',
    note TEXT,
    registrar TEXT,
    registration_date DATE,
    expiration_date DATE,
    nameservers TEXT[],
    domain_id_external TEXT,
    last_update_date DATE,
    domain_status TEXT DEFAULT 'active' CHECK (domain_status IN ('active', 'expired', 'suspended')),
    whois_status TEXT,  -- New column for storing original WHOIS status
    dnssec_status TEXT DEFAULT 'unsigned',
    hosting_info TEXT DEFAULT '',
    whois_data JSONB,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create RLS policies
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view domains
CREATE POLICY "Authenticated users can view domains" ON public.domains
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can insert domains
CREATE POLICY "Only admins can insert domains" ON public.domains
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update domains
CREATE POLICY "Only admins can update domains" ON public.domains
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete domains
CREATE POLICY "Only admins can delete domains" ON public.domains
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_domains_expiration_date ON public.domains(expiration_date);
CREATE INDEX IF NOT EXISTS idx_domains_name ON public.domains(name);
CREATE INDEX IF NOT EXISTS idx_domains_domain_status ON public.domains(domain_status);

-- Step 5: Insert initial data
INSERT INTO public.domains (
    name,
    renewal_price,
    note,
    registrar,
    registration_date,
    expiration_date,
    nameservers,
    domain_id_external,
    last_update_date,
    domain_status,
    whois_status,
    dnssec_status,
    hosting_info,
    created_at
) VALUES
    (
        'google.com',
        15.99,
        'Test dengan domain nyata',
        'MarkMonitor Inc.',
        '1997-09-15',
        '2028-09-14',
        ARRAY['ns1.google.com', 'ns2.google.com', 'ns3.google.com', 'ns4.google.com'],
        '2138514_DOMAIN_COM-VRSN',
        '2019-09-09',
        'active',  -- Simplified status
        'clientTransferProhibited',  -- Original WHOIS status
        'unsigned',
        '',
        '2025-07-01 14:24:37'
    ),
    (
        'warnahost.com',
        0.00,
        '',
        'NameSilo, LLC',
        '2013-06-05',
        '2026-06-05',
        ARRAY['ken.ns.cloudflare.com', 'nina.ns.cloudflare.com'],
        '1806292641_DOMAIN_COM-VRSN',
        '2025-05-28',
        'active',
        'clientTransferProhibited',
        'unsigned',
        '',
        '2025-07-01 14:25:18'
    ),
    (
        'indexof.id',
        250000.00,
        '',
        'Registrasi Neva Angkasa',
        '2025-06-26',
        '2027-06-26',
        ARRAY['ben.ns.cloudflare.com', 'kim.ns.cloudflare.com'],
        'PANDI-DO15082678',
        '2025-06-26',
        'active',
        'clientTransferProhibited',
        'Unsigned',
        '',
        '2025-07-01 14:25:54'
    ),
    (
        'facebook.com',
        0.00,
        '',
        'RegistrarSafe, LLC',
        '1997-03-29',
        '2034-03-30',
        ARRAY['a.ns.facebook.com', 'b.ns.facebook.com', 'c.ns.facebook.com', 'd.ns.facebook.com'],
        '2320948_DOMAIN_COM-VRSN',
        '2025-04-23',
        'active',
        'clientTransferProhibited',
        'unsigned',
        '',
        '2025-07-01 15:09:26'
    ),
    (
        'giznet.id',
        250000.00,
        '',
        'dewabiz',
        '2021-07-05',
        '2026-07-05',
        ARRAY['ben.ns.cloudflare.com', 'kim.ns.cloudflare.com'],
        'PANDI-DO5655099',
        '2024-08-19',
        'active',
        'clientTransferProhibited',
        'Unsigned',
        '',
        '2025-07-02 01:35:59'
    ),
    (
        'heyapakabar.com',
        210000.00,
        '',
        'HOSTINGER operations, UAB',
        '2019-03-02',
        '2026-03-02',
        ARRAY['laura.ns.cloudflare.com', 'theo.ns.cloudflare.com'],
        '2365415693_DOMAIN_COM-VRSN',
        '2025-03-15',
        'active',
        'clientTransferProhibited',
        'unsigned',
        '',
        '2025-07-02 01:38:46'
    ),
    (
        'bicaradigital.com',
        210000.00,
        '',
        'HOSTINGER operations, UAB',
        '2024-07-07',
        '2025-07-07',
        ARRAY['andy.ns.cloudflare.com', 'love.ns.cloudflare.com'],
        '2897125085_DOMAIN_COM-VRSN',
        '2024-07-07',
        'active',
        'clientTransferProhibited',
        'unsigned',
        '',
        '2025-07-02 01:45:36'
    ),
    (
        'jasakami.id',
        0.00,
        '',
        'jogjacamp',
        '2025-03-02',
        '2026-03-02',
        ARRAY['ben.ns.cloudflare.com', 'kim.ns.cloudflare.com'],
        'PANDI-DO13151690',
        '2025-03-02',
        'active',
        'clientTransferProhibited',
        'Unsigned',
        '',
        '2025-07-02 10:33:52'
    ),
    (
        'gosite.id',
        0.00,
        '',
        'jogjacamp',
        '2019-05-09',
        '2026-05-09',
        ARRAY['ns1.dns-parking.com', 'ns2.dns-parking.com'],
        'PANDI-DO1400766',
        '2025-05-13',
        'active',
        'clientTransferProhibited',
        'Unsigned',
        '',
        '2025-07-02 15:47:34'
    ),
    (
        'x.com',
        0.00,
        '',
        'GoDaddy.com, LLC',
        '1993-04-02',
        '2034-10-20',
        ARRAY['a.r10.twtrdns.net', 'a.u10.twtrdns.net'],
        '',
        NULL,
        'active',
        '',
        '',
        '',
        '2025-07-02 17:29:29'
    ),
    (
        'jasakami.web.id',
        0.00,
        '',
        'digitalreg',
        '2025-03-12',
        '2026-03-12',
        ARRAY['ben.ns.cloudflare.com', 'kim.ns.cloudflare.com'],
        'PANDI-DO13273564',
        '2025-05-24',
        'active',
        'clientTransferProhibited',
        'Unsigned',
        '',
        '2025-07-02 18:26:11'
    ); 