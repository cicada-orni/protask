ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view other users"
ON auth.users FOR SELECT
TO authenticated
USING (true);