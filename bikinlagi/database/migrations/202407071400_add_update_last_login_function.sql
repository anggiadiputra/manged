CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.staff
  SET last_login = NOW()
  WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.update_last_login() TO authenticated; 