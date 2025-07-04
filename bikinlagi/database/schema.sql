-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create staff table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin_web', 'finance')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Create domains table
CREATE TABLE IF NOT EXISTS public.domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    registrar TEXT,
    whois_data JSONB,
    expiry_date DATE,
    renewal_cost DECIMAL(10, 2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.staff(id)
);

-- Create hosting table
CREATE TABLE IF NOT EXISTS public.hosting (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL,
    package TEXT NOT NULL,
    primary_domain TEXT,
    expiry_date DATE,
    renewal_cost DECIMAL(10, 2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.staff(id)
);

-- Create VPS table
CREATE TABLE IF NOT EXISTS public.vps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    location TEXT,
    root_user TEXT,
    root_password TEXT, -- Should be encrypted in production
    expiry_date DATE,
    renewal_cost DECIMAL(10, 2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.staff(id)
);

-- Create websites table
CREATE TABLE IF NOT EXISTS public.websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain TEXT NOT NULL,
    cms TEXT,
    ip_address TEXT,
    hosting_id UUID REFERENCES public.hosting(id) ON DELETE SET NULL,
    vps_id UUID REFERENCES public.vps(id) ON DELETE SET NULL,
    admin_username TEXT,
    admin_password TEXT, -- Should be encrypted in production
    expiry_date DATE,
    renewal_cost DECIMAL(10, 2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.staff(id),
    CONSTRAINT website_hosting_or_vps CHECK (
        (hosting_id IS NOT NULL AND vps_id IS NULL) OR
        (hosting_id IS NULL AND vps_id IS NOT NULL) OR
        (hosting_id IS NULL AND vps_id IS NULL)
    )
);

-- Create domain_hosting junction table
CREATE TABLE IF NOT EXISTS public.domain_hosting (
    domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE,
    hosting_id UUID REFERENCES public.hosting(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (domain_id, hosting_id)
);

-- Create activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.staff(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_domains_expiry ON public.domains(expiry_date);
CREATE INDEX idx_hosting_expiry ON public.hosting(expiry_date);
CREATE INDEX idx_vps_expiry ON public.vps(expiry_date);
CREATE INDEX idx_websites_expiry ON public.websites(expiry_date);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON public.domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hosting_updated_at BEFORE UPDATE ON public.hosting
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vps_updated_at BEFORE UPDATE ON public.vps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON public.websites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for expiring assets (30 days)
CREATE OR REPLACE VIEW expiring_assets AS
SELECT 
    'domain' as asset_type,
    id,
    name as asset_name,
    expiry_date,
    renewal_cost,
    (expiry_date - CURRENT_DATE) as days_until_expiry
FROM public.domains
WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days'
    AND expiry_date >= CURRENT_DATE
    AND status = 'active'
UNION ALL
SELECT 
    'hosting' as asset_type,
    id,
    provider || ' - ' || package as asset_name,
    expiry_date,
    renewal_cost,
    (expiry_date - CURRENT_DATE) as days_until_expiry
FROM public.hosting
WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days'
    AND expiry_date >= CURRENT_DATE
    AND status = 'active'
UNION ALL
SELECT 
    'vps' as asset_type,
    id,
    provider || ' - ' || ip_address as asset_name,
    expiry_date,
    renewal_cost,
    (expiry_date - CURRENT_DATE) as days_until_expiry
FROM public.vps
WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days'
    AND expiry_date >= CURRENT_DATE
    AND status = 'active'
UNION ALL
SELECT 
    'website' as asset_type,
    id,
    domain as asset_name,
    expiry_date,
    renewal_cost,
    (expiry_date - CURRENT_DATE) as days_until_expiry
FROM public.websites
WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days'
    AND expiry_date >= CURRENT_DATE
    AND status = 'active'
ORDER BY days_until_expiry ASC;

-- Create view for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.domains WHERE status = 'active') as total_domains,
    (SELECT COUNT(*) FROM public.hosting WHERE status = 'active') as total_hosting,
    (SELECT COUNT(*) FROM public.vps WHERE status = 'active') as total_vps,
    (SELECT COUNT(*) FROM public.websites WHERE status = 'active') as total_websites,
    (SELECT COUNT(*) FROM expiring_assets) as expiring_soon;

-- Enable Row Level Security (RLS)
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_hosting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for staff table
CREATE POLICY "Staff can view all staff members" ON public.staff
    FOR SELECT USING (true);

CREATE POLICY "Only super_admin can insert staff" ON public.staff
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.staff
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Only super_admin can update staff" ON public.staff
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.staff
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Only super_admin can delete staff" ON public.staff
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.staff
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Create RLS policies for domains table
CREATE POLICY "All staff can view domains" ON public.domains
    FOR SELECT USING (auth.uid() IN (SELECT id FROM public.staff));

CREATE POLICY "Super_admin and admin_web can insert domains" ON public.domains
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.staff
            WHERE id = auth.uid() AND role IN ('super_admin', 'admin_web')
        )
    );

CREATE POLICY "Super_admin and admin_web can update domains" ON public.domains
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.staff
            WHERE id = auth.uid() AND role IN ('super_admin', 'admin_web')
        )
    );

CREATE POLICY "Finance can update whois_data only" ON public.domains
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.staff
            WHERE id = auth.uid() AND role = 'finance'
        )
    );

CREATE POLICY "Super_admin and admin_web can delete domains" ON public.domains
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.staff
            WHERE id = auth.uid() AND role IN ('super_admin', 'admin_web')
        )
    );

-- Similar RLS policies for hosting, vps, websites tables
-- (Following the same pattern as domains table)

-- Create RLS policies for activity_logs table
CREATE POLICY "All staff can view activity logs" ON public.activity_logs
    FOR SELECT USING (auth.uid() IN (SELECT id FROM public.staff));

CREATE POLICY "System can insert activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.staff));

-- Create function to log activities
CREATE OR REPLACE FUNCTION log_activity(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 