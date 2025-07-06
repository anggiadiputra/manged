CREATE OR REPLACE FUNCTION public.update_domain_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika expiry_date tidak ada, set status ke 'pending' atau sesuai kebutuhan
    IF NEW.expiry_date IS NULL THEN
        NEW.status = 'pending';
    -- Jika expiry_date sudah lewat lebih dari 30 hari (dianggap hangus)
    ELSIF NEW.expiry_date < NOW() - INTERVAL '30 days' THEN
        NEW.status = 'expired';
    -- Jika expiry_date sudah lewat tapi masih dalam 30 hari (masa tenggang)
    ELSIF NEW.expiry_date < NOW() THEN
        NEW.status = 'grace';
    -- Jika tidak ada kondisi di atas, domain dianggap aktif
    ELSE
        NEW.status = 'active';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Buat atau ganti trigger yang ada
DROP TRIGGER IF EXISTS trigger_update_domain_status ON public.domains;
CREATE TRIGGER trigger_update_domain_status
BEFORE INSERT OR UPDATE ON public.domains
FOR EACH ROW
EXECUTE FUNCTION public.update_domain_status(); 