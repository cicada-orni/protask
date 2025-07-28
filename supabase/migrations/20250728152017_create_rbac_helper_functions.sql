
CREATE OR REPLACE FUNCTION public.get_user_role(ws_id uuid)
RETURNS public.app_role 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role public.app_role;
BEGIN
  SELECT role
  INTO user_role
  FROM public.workspace_members
  WHERE user_id = auth.uid() AND workspace_id = ws_id;
  
  RETURN user_role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;