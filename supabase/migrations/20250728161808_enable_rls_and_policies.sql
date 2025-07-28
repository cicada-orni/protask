-- ************************************************************* --

-- Policies for workspaces --
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
-- READ --
DROP POLICY IF EXISTS "Users can view their own workspaces" ON public.workspaces;
CREATE POLICY "Users can view their own workspaces"
ON public.workspaces FOR SELECT
TO authenticated
USING(
    EXISTS(
        SELECT 1
        FROM public.workspace_members
        WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()
    )
);

-- WRITE --
DROP POLICY IF EXISTS "Users can create new workspaces" ON public.workspaces;
CREATE POLICY "Users can create new workspaces"
ON public.workspaces FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE --
DROP POLICY IF EXISTS "Users can update their own workspaces" ON public.workspaces;
CREATE POLICY "Users can update their own workspaces"
ON public.workspaces FOR UPDATE
TO authenticated
USING (public.get_user_role(id) = 'admin')
WITH CHECK (public.get_user_role(id) = 'admin');

-- DELETE --
DROP POLICY IF EXISTS "Users can delete their own workspaces" ON public.workspaces;
CREATE POLICY "Users can delete their own workspaces"
ON public.workspaces FOR DELETE
TO authenticated
USING(public.get_user_role(id) = 'admin');

-- ************************************************************* --

-- Policies for workspace_members --
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
-- READ --
DROP POLICY IF EXISTS "Members can view other members of their own workspace" ON public.workspace_members;
CREATE POLICY "Members can view other members of their own workspace"
ON public.workspace_members FOR SELECT
TO authenticated
USING (
    EXISTS(
        SELECT 1
        FROM public.workspace_members AS member_check
        WHERE member_check.workspace_id = public.workspace_members.workspace_id
        AND member_check.user_id = auth.uid()
    )
);

-- WRITE --
DROP POLICY IF EXISTS "Admins can add new members to their workspace" ON public.workspace_members;
CREATE POLICY "Admins can add new members to their workspace"
ON public.workspace_members FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(workspace_id) = 'admin');

-- UPDATE --
DROP POLICY IF EXISTS "Admins can update member roles in their workspace" ON public.workspace_members;
CREATE POLICY "Admins can update member roles in their workspace"
ON public.workspace_members FOR UPDATE
TO authenticated
USING(public.get_user_role(workspace_id) = 'admin');

-- DELETE --
DROP POLICY IF EXISTS "Admins can remove members, and users can remove themselves" ON public.workspace_members;
CREATE POLICY "Admins can remove members, and users can remove themselves"
ON public.workspace_members FOR DELETE
TO authenticated
USING (public.get_user_role(workspace_id) = 'admin' OR user_id = auth.uid());

-- ************************************************************* --

-- Policies for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
-- READ --
DROP POLICY IF EXISTS "Members can view projects in their own workspace" ON public.projects;
CREATE POLICY "Members can view projects in their own workspace"
ON public.projects FOR SELECT
TO authenticated
USING (
    EXISTS(
        SELECT 1
        FROM public.workspace_members
        WHERE workspace_members.workspace_id = projects.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
);

-- WRITE --
DROP POLICY IF EXISTS "Members can create projects in their own workspace" ON public.projects;
CREATE POLICY "Members can create projects in their own workspace"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS(
        SELECT 1
        FROM public.workspace_members
        WHERE workspace_members.workspace_id = projects.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
);

-- UPDATE --
DROP POLICY IF EXISTS "Admins can update projects in their workspace" ON public.projects;
CREATE POLICY "Admins can update projects in their workspace"
ON public.projects FOR UPDATE
TO authenticated
USING(public.get_user_role(workspace_id) = 'admin');

-- DELETE --
DROP POLICY IF EXISTS "Admins can delete projects in their workspace" ON public.projects;
CREATE POLICY "Admins can delete projects in their workspace"
ON public.projects FOR DELETE
TO authenticated
USING (
  public.get_user_role(workspace_id) = 'admin'
);

-- ************************************************************* --
-- Policies for boards --
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

-- READ Policy
DROP POLICY IF EXISTS "Members can view boards in their workspace" ON public.boards;
CREATE POLICY "Members can view boards in their workspace"
ON public.boards FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects p
    JOIN public.workspace_members wm ON p.workspace_id = wm.workspace_id
    WHERE p.id = boards.project_id AND wm.user_id = auth.uid()
  )
);

-- INSERT Policy
DROP POLICY IF EXISTS "Members can create boards in their workspace" ON public.boards;
CREATE POLICY "Members can create boards in their workspace"
ON public.boards FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.projects p
    JOIN public.workspace_members wm ON p.workspace_id = wm.workspace_id
    WHERE p.id = boards.project_id AND wm.user_id = auth.uid()
  )
);

-- UPDATE Policy
DROP POLICY IF EXISTS "Admins can update boards in their workspace" ON public.boards;
CREATE POLICY "Admins can update boards in their workspace"
ON public.boards FOR UPDATE
TO authenticated
USING (
  public.get_user_role(
    (SELECT p.workspace_id FROM public.projects p WHERE p.id = boards.project_id)
  ) = 'admin'
);

-- DELETE Policy
DROP POLICY IF EXISTS "Admins can delete boards in their workspace" ON public.boards;
CREATE POLICY "Admins can delete boards in their workspace"
ON public.boards FOR DELETE
TO authenticated
USING (
  public.get_user_role(
    (SELECT p.workspace_id FROM public.projects p WHERE p.id = boards.project_id)
  ) = 'admin'
);

-- ************************************************************* --

-- Policies for columns --
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;

-- READ Policy: Members can view columns in their workspace.
DROP POLICY IF EXISTS "Members can view columns in their workspace" ON public.columns;
CREATE POLICY "Members can view columns in their workspace"
ON public.columns FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects p
    JOIN public.boards b ON p.id = b.project_id
    JOIN public.workspace_members wm ON p.workspace_id = wm.workspace_id
    WHERE b.id = columns.board_id AND wm.user_id = auth.uid()
  )
);

-- INSERT Policy: Members can create columns in their workspace.
DROP POLICY IF EXISTS "Members can create columns in their workspace" ON public.columns;
CREATE POLICY "Members can create columns in their workspace"
ON public.columns FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.projects p
    JOIN public.boards b ON p.id = b.project_id
    JOIN public.workspace_members wm ON p.workspace_id = wm.workspace_id
    WHERE b.id = columns.board_id AND wm.user_id = auth.uid()
  )
);

-- UPDATE Policy: Admins can update columns in their workspace.
DROP POLICY IF EXISTS "Admins can update columns in their workspace" ON public.columns;
CREATE POLICY "Admins can update columns in their workspace"
ON public.columns FOR UPDATE
TO authenticated
USING (
  public.get_user_role(
    (
      SELECT p.workspace_id
      FROM public.projects p
      JOIN public.boards b ON p.id = b.project_id
      WHERE b.id = columns.board_id
    )
  ) = 'admin'
);

-- DELETE Policy: Admins can delete columns in their workspace.
DROP POLICY IF EXISTS "Admins can delete columns in their workspace" ON public.columns;
CREATE POLICY "Admins can delete columns in their workspace"
ON public.columns FOR DELETE
TO authenticated
USING (
  public.get_user_role(
    (
      SELECT p.workspace_id
      FROM public.projects p
      JOIN public.boards b ON p.id = b.project_id
      WHERE b.id = columns.board_id
    )
  ) = 'admin'
);


-- ************************************************************* --
-- Policies for tasks --
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- READ Policy: Members can view tasks in their workspace.
DROP POLICY IF EXISTS "Members can view tasks in their workspace" ON public.tasks;
CREATE POLICY "Members can view tasks in their workspace"
ON public.tasks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects p
    JOIN public.boards b ON p.id = b.project_id
    JOIN public.columns c ON b.id = c.board_id
    JOIN public.workspace_members wm ON p.workspace_id = wm.workspace_id
    WHERE c.id = tasks.column_id AND wm.user_id = auth.uid()
  )
);

-- INSERT Policy: Members can create tasks in their workspace.
DROP POLICY IF EXISTS "Members can create tasks in their workspace" ON public.tasks;
CREATE POLICY "Members can create tasks in their workspace"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.projects p
    JOIN public.boards b ON p.id = b.project_id
    JOIN public.columns c ON b.id = c.board_id
    JOIN public.workspace_members wm ON p.workspace_id = wm.workspace_id
    WHERE c.id = tasks.column_id AND wm.user_id = auth.uid()
  )
);

-- UPDATE Policy: Members can update tasks in their workspace.
DROP POLICY IF EXISTS "Members can update tasks in their workspace" ON public.tasks;
CREATE POLICY "Members can update tasks in their workspace"
ON public.tasks FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects p
    JOIN public.boards b ON p.id = b.project_id
    JOIN public.columns c ON b.id = c.board_id
    JOIN public.workspace_members wm ON p.workspace_id = wm.workspace_id
    WHERE c.id = tasks.column_id AND wm.user_id = auth.uid()
  )
);

-- DELETE Policy: Members can delete tasks in their workspace.
DROP POLICY IF EXISTS "Members can delete tasks in their workspace" ON public.tasks;
CREATE POLICY "Members can delete tasks in their workspace"
ON public.tasks FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects p
    JOIN public.boards b ON p.id = b.project_id
    JOIN public.columns c ON b.id = c.board_id
    JOIN public.workspace_members wm ON p.workspace_id = wm.workspace_id
    WHERE c.id = tasks.column_id AND wm.user_id = auth.uid()
  )
);


-- ************************************************************* --

-- Policies for tags --
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- READ Policy: Members can view tags in their workspace.
DROP POLICY IF EXISTS "Members can view tags in their workspace" ON public.tags;
CREATE POLICY "Members can view tags in their workspace"
ON public.tags FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = tags.workspace_id AND wm.user_id = auth.uid()
  )
);

-- INSERT Policy: Members can create tags in their workspace.
DROP POLICY IF EXISTS "Members can create tags in their workspace" ON public.tags;
CREATE POLICY "Members can create tags in their workspace"
ON public.tags FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = tags.workspace_id AND wm.user_id = auth.uid()
  )
);

-- UPDATE Policy: Admins can update tags in their workspace.
DROP POLICY IF EXISTS "Admins can update tags in their workspace" ON public.tags;
CREATE POLICY "Admins can update tags in their workspace"
ON public.tags FOR UPDATE
TO authenticated
USING (
  public.get_user_role(workspace_id) = 'admin'
);

-- DELETE Policy: Admins can delete tags in their workspace.
DROP POLICY IF EXISTS "Admins can delete tags in their workspace" ON public.tags;
CREATE POLICY "Admins can delete tags in their workspace"
ON public.tags FOR DELETE
TO authenticated
USING (
  public.get_user_role(workspace_id) = 'admin'
);

-- ************************************************************* --

-- Policies for task_assignees --
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

-- READ/WRITE Policies: Members can assign/unassign users to tasks.
DROP POLICY IF EXISTS "Members can manage task assignees" ON public.task_assignees;
CREATE POLICY "Members can manage task assignees"
ON public.task_assignees FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM tasks t
    JOIN columns c ON t.column_id = c.id
    JOIN boards b ON c.board_id = b.id
    JOIN projects p ON b.project_id = p.id
    JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
    WHERE t.id = task_assignees.task_id AND wm.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM tasks t
    JOIN columns c ON t.column_id = c.id
    JOIN boards b ON c.board_id = b.id
    JOIN projects p ON b.project_id = p.id
    JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
    WHERE t.id = task_assignees.task_id AND wm.user_id = auth.uid()
  )
);

-- ************************************************************* --
-- Policies for task_tags --
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;

-- READ/WRITE Policies: Members can add/remove tags from tasks.
DROP POLICY IF EXISTS "Members can manage task tags" ON public.task_tags;
CREATE POLICY "Members can manage task tags"
ON public.task_tags FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM tasks t
    JOIN columns c ON t.column_id = c.id
    JOIN boards b ON c.board_id = b.id
    JOIN projects p ON b.project_id = p.id
    JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
    WHERE t.id = task_tags.task_id AND wm.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM tasks t
    JOIN columns c ON t.column_id = c.id
    JOIN boards b ON c.board_id = b.id
    JOIN projects p ON b.project_id = p.id
    JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
    WHERE t.id = task_tags.task_id AND wm.user_id = auth.uid()
  )
);