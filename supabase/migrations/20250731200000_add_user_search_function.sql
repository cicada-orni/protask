-- Creates a function that can securely search for users by email
-- without violating RLS policies.
CREATE OR REPLACE FUNCTION public.search_users_by_email(email_list text[])
RETURNS TABLE (id uuid, email text) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email::text
  FROM auth.users AS u
  WHERE u.email = ANY(email_list);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;