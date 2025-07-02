-- Create profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create domains table
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
    domain_status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
    dnssec_status TEXT DEFAULT 'unsigned',
    hosting_info TEXT DEFAULT '',
    whois_data JSONB,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hosting table
CREATE TABLE IF NOT EXISTS public.hosting (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL,
    package_name TEXT NOT NULL,
    primary_domain TEXT,
    server_location TEXT,
    cpanel_url TEXT,
    username TEXT,
    renewal_date DATE NOT NULL,
    cost DECIMAL(10,2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create VPS table
CREATE TABLE IF NOT EXISTS public.vps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL,
    server_name TEXT NOT NULL,
    ip_address INET,
    server_location TEXT,
    operating_system TEXT,
    cpu_cores INTEGER,
    ram_gb INTEGER,
    storage_gb INTEGER,
    bandwidth_gb INTEGER,
    renewal_date DATE NOT NULL,
    cost DECIMAL(10,2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
    root_password TEXT, -- Consider encrypting this
    ssh_port INTEGER DEFAULT 22,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_domains_updated_at
    BEFORE UPDATE ON public.domains
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_hosting_updated_at
    BEFORE UPDATE ON public.hosting
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_vps_updated_at
    BEFORE UPDATE ON public.vps
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Domains policies
CREATE POLICY "Authenticated users can view domains" ON public.domains
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert domains" ON public.domains
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update domains" ON public.domains
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete domains" ON public.domains
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Hosting policies (same pattern as domains)
CREATE POLICY "Authenticated users can view hosting" ON public.hosting
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert hosting" ON public.hosting
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update hosting" ON public.hosting
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete hosting" ON public.hosting
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- VPS policies (same pattern as domains)
CREATE POLICY "Authenticated users can view vps" ON public.vps
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert vps" ON public.vps
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update vps" ON public.vps
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete vps" ON public.vps
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'viewer');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_domains_expiration_date ON public.domains(expiration_date);
CREATE INDEX IF NOT EXISTS idx_hosting_renewal_date ON public.hosting(renewal_date);
CREATE INDEX IF NOT EXISTS idx_vps_renewal_date ON public.vps(renewal_date);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role); 