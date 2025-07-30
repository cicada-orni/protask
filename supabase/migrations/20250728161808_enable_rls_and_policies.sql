-- ==== HELPER FUNCTION (SAFE TO USE) ====
-- Checks if a user is a member of a workspace. This is safe because it will be
-- used by policies on OTHER tables (like 'projects'), not on 'workspace_members' itself.
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id uuid, user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND workspace_members.user_id = user_id
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- ==== WORKSPACES TABLE POLICIES ====
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their own workspaces"
ON public.workspaces FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace members can view the workspace"
ON public.workspaces FOR SELECT
TO authenticated
USING (is_workspace_member(id, auth.uid()));


-- ==== WORKSPACE_MEMBERS TABLE POLICIES (NON-RECURSIVE) ====
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage workspace members"
ON public.workspace_members FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_members.workspace_id AND owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_members.workspace_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Members can view other members of their workspace"
ON public.workspace_members FOR SELECT
TO authenticated
USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Members can remove themselves from a workspace"
ON public.workspace_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());


-- ==== PROJECTS TABLE POLICIES ====
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can manage projects in their workspace"
ON public.projects FOR ALL
TO authenticated
USING (is_workspace_member(workspace_id, auth.uid()))
WITH CHECK (is_workspace_member(workspace_id, auth.uid()));


-- ==== Apply policies to all other tables based on workspace membership ====
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can manage boards in their workspace" ON public.boards FOR ALL USING (is_workspace_member((SELECT workspace_id FROM projects WHERE id = project_id), auth.uid())) WITH CHECK (is_workspace_member((SELECT workspace_id FROM projects WHERE id = project_id), auth.uid()));

ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can manage columns in their workspace" ON public.columns FOR ALL USING (is_workspace_member((SELECT p.workspace_id FROM projects p JOIN boards b ON p.id = b.project_id WHERE b.id = board_id), auth.uid())) WITH CHECK (is_workspace_member((SELECT p.workspace_id FROM projects p JOIN boards b ON p.id = b.project_id WHERE b.id = board_id), auth.uid()));

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can manage tasks in their workspace" ON public.tasks FOR ALL USING (is_workspace_member((SELECT p.workspace_id FROM projects p JOIN boards b ON p.id = b.project_id JOIN columns c ON b.id = c.board_id WHERE c.id = column_id), auth.uid())) WITH CHECK (is_workspace_member((SELECT p.workspace_id FROM projects p JOIN boards b ON p.id = b.project_id JOIN columns c ON b.id = c.board_id WHERE c.id = column_id), auth.uid()));

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can manage tags in their workspace" ON public.tags FOR ALL USING (is_workspace_member(workspace_id, auth.uid())) WITH CHECK (is_workspace_member(workspace_id, auth.uid()));

ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can manage task assignees in their workspace" ON public.task_assignees FOR ALL USING (is_workspace_member((SELECT p.workspace_id FROM projects p JOIN boards b ON p.id = b.project_id JOIN columns c ON b.id = c.board_id JOIN tasks t ON c.id = t.column_id WHERE t.id = task_id), auth.uid())) WITH CHECK (is_workspace_member((SELECT p.workspace_id FROM projects p JOIN boards b ON p.id = b.project_id JOIN columns c ON b.id = c.board_id JOIN tasks t ON c.id = t.column_id WHERE t.id = task_id), auth.uid()));

ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can manage task tags in their workspace" ON public.task_tags FOR ALL USING (is_workspace_member((SELECT p.workspace_id FROM projects p JOIN boards b ON p.id = b.project_id JOIN columns c ON b.id = c.board_id JOIN tasks t ON c.id = t.column_id WHERE t.id = task_id), auth.uid())) WITH CHECK (is_workspace_member((SELECT p.workspace_id FROM projects p JOIN boards b ON p.id = b.project_id JOIN columns c ON b.id = c.board_id JOIN tasks t ON c.id = t.column_id WHERE t.id = task_id), auth.uid()));