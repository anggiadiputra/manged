-- Migration: update staff foreign keys to use ON UPDATE CASCADE constraints

-- Domains.created_by
ALTER TABLE IF EXISTS public.domains
  DROP CONSTRAINT IF EXISTS domains_created_by_fkey;
ALTER TABLE public.domains
  ADD CONSTRAINT domains_created_by_fkey FOREIGN KEY (created_by)
  REFERENCES public.staff(id) ON UPDATE CASCADE;

-- Hosting.created_by
ALTER TABLE IF EXISTS public.hosting
  DROP CONSTRAINT IF EXISTS hosting_created_by_fkey;
ALTER TABLE public.hosting
  ADD CONSTRAINT hosting_created_by_fkey FOREIGN KEY (created_by)
  REFERENCES public.staff(id) ON UPDATE CASCADE;

-- VPS.created_by
ALTER TABLE IF EXISTS public.vps
  DROP CONSTRAINT IF EXISTS vps_created_by_fkey;
ALTER TABLE public.vps
  ADD CONSTRAINT vps_created_by_fkey FOREIGN KEY (created_by)
  REFERENCES public.staff(id) ON UPDATE CASCADE;

-- Websites.created_by
ALTER TABLE IF EXISTS public.websites
  DROP CONSTRAINT IF EXISTS websites_created_by_fkey;
ALTER TABLE public.websites
  ADD CONSTRAINT websites_created_by_fkey FOREIGN KEY (created_by)
  REFERENCES public.staff(id) ON UPDATE CASCADE;

-- Activity_logs.user_id
ALTER TABLE IF EXISTS public.activity_logs
  DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
ALTER TABLE public.activity_logs
  ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id)
  REFERENCES public.staff(id) ON UPDATE CASCADE; 