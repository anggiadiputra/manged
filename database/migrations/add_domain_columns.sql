-- Rename cost to renewal_price
ALTER TABLE public.domains RENAME COLUMN cost TO renewal_price;

-- Rename notes to note
ALTER TABLE public.domains RENAME COLUMN notes TO note;

-- Add new columns
ALTER TABLE public.domains ADD COLUMN IF NOT EXISTS nameservers TEXT[];
ALTER TABLE public.domains ADD COLUMN IF NOT EXISTS domain_id_external TEXT;
ALTER TABLE public.domains ADD COLUMN IF NOT EXISTS last_update_date DATE;
ALTER TABLE public.domains ADD COLUMN IF NOT EXISTS dnssec_status TEXT DEFAULT 'unsigned';
ALTER TABLE public.domains ADD COLUMN IF NOT EXISTS hosting_info TEXT DEFAULT '';

-- Rename status to domain_status
ALTER TABLE public.domains RENAME COLUMN status TO domain_status;

-- Set default for renewal_price if not exists
ALTER TABLE public.domains ALTER COLUMN renewal_price SET DEFAULT '0.00'; 