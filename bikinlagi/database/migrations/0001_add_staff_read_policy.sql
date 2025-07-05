-- Create a policy that allows authenticated users to read their own staff record.
CREATE POLICY "Allow authenticated users to read their own staff record"
ON public.staff
FOR SELECT
TO authenticated
USING (auth.uid() = id); 