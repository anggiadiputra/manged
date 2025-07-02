-- Add whois_data column to domains table
ALTER TABLE public.domains ADD COLUMN IF NOT EXISTS whois_data JSONB; 