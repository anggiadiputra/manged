-- Drop existing domains table
DROP TABLE IF EXISTS public.domains;

-- Create domains table with new structure
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
    dnssec_status TEXT DEFAULT 'unsigned',
    hosting_info TEXT DEFAULT '',
    whois_data JSONB,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_domains_expiration_date ON public.domains(expiration_date);
CREATE INDEX IF NOT EXISTS idx_domains_name ON public.domains(name);
CREATE INDEX IF NOT EXISTS idx_domains_domain_status ON public.domains(domain_status); 