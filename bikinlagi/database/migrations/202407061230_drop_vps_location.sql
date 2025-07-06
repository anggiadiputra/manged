-- Drop kolom location dari tabel vps karena tidak lagi digunakan
ALTER TABLE public.vps
DROP COLUMN IF EXISTS location; 