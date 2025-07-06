-- Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add encrypted column
ALTER TABLE public.vps ADD COLUMN IF NOT EXISTS root_password_enc bytea;

-- Set application encryption key (replace with secure value in prod)
-- You can set this in Postgres conf or a secret; here we use a setting for demo
SELECT set_config('app.encryption_key', COALESCE(current_setting('app.encryption_key', true), 'my-secret-passphrase'), false);

-- Encrypt existing passwords
UPDATE public.vps
SET root_password_enc = pgp_sym_encrypt(root_password, current_setting('app.encryption_key'))
WHERE root_password IS NOT NULL;

-- Remove plaintext column
ALTER TABLE public.vps DROP COLUMN IF EXISTS root_password;

-- Trigger to encrypt on insert/update
CREATE OR REPLACE FUNCTION encrypt_root_password_trigger()
RETURNS trigger AS $$
BEGIN
  IF NEW.root_password IS NOT NULL THEN
    NEW.root_password_enc := pgp_sym_encrypt(NEW.root_password, current_setting('app.encryption_key'));
    NEW.root_password := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_encrypt_root_password ON public.vps;
CREATE TRIGGER trg_encrypt_root_password
BEFORE INSERT OR UPDATE ON public.vps
FOR EACH ROW EXECUTE FUNCTION encrypt_root_password_trigger();

-- RPC to fetch decrypted credentials
CREATE OR REPLACE FUNCTION public.get_vps_credentials(p_vps_id uuid)
RETURNS TABLE(ip text, root_user text, root_password text) AS $$
BEGIN
  RETURN QUERY
  SELECT v.ip_address, v.root_user, pgp_sym_decrypt(v.root_password_enc, current_setting('app.encryption_key'))
  FROM public.vps v
  WHERE v.id = p_vps_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon (only if desired) otherwise staff role
GRANT EXECUTE ON FUNCTION public.get_vps_credentials(uuid) TO anon; 