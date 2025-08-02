
-- Create the 'comments' table
CREATE TABLE public.comments (

    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content text NOT NULL,
    task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL
);


ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow members of a workspace to view comments on tasks within that workspace.
CREATE POLICY "Members can view comments in their workspace"
ON public.comments FOR SELECT
TO authenticated
USING (
  is_workspace_member(
    (
      SELECT p.workspace_id
      FROM public.projects p
      JOIN public.boards b ON p.id = b.project_id
      JOIN public.columns c ON b.id = c.board_id
      JOIN public.tasks t ON c.id = t.column_id
      WHERE t.id = comments.task_id
    ),
    auth.uid()
  )
);

-- Policy: Allow a user to insert a comment if they are a member of the workspace containing the task.
CREATE POLICY "Members can insert comments in their workspace"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (
  is_workspace_member(
    (
      SELECT p.workspace_id
      FROM public.projects p
      JOIN public.boards b ON p.id = b.project_id
      JOIN public.columns c ON b.id = c.board_id
      JOIN public.tasks t ON c.id = t.column_id
      WHERE t.id = comments.task_id
    ),
    auth.uid()
  )
);

-- Policy: Allow users to update ONLY their own comments.
CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE
TO authenticated
USING (
  is_workspace_member(
    (
      SELECT p.workspace_id
      FROM public.projects p
      JOIN public.boards b ON p.id = b.project_id
      JOIN public.columns c ON b.id = c.board_id
      JOIN public.tasks t ON c.id = t.column_id
      WHERE t.id = comments.task_id
    ),
    auth.uid()
  ) AND (user_id = auth.uid())
);

-- Policy: Allow users to delete ONLY their own comments.
CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
TO authenticated
USING (
  is_workspace_member(
    (
      SELECT p.workspace_id
      FROM public.projects p
      JOIN public.boards b ON p.id = b.project_id
      JOIN public.columns c ON b.id = c.board_id
      JOIN public.tasks t ON c.id = t.column_id
      WHERE t.id = comments.task_id
    ),
    auth.uid()
  ) AND (user_id = auth.uid())
);