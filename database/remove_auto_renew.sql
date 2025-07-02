-- Run this script in Supabase SQL Editor to remove auto_renew column from domains table
-- Go to: https://supabase.com/dashboard/project/[your-project-id]/sql
 
-- Remove auto_renew column from domains table
ALTER TABLE public.domains DROP COLUMN IF EXISTS auto_renew; 