CREATE TYPE public.app_role AS ENUM('admin', 'member');

-- Workspace table
CREATE TABLE public.workspaces(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Workspace Members table
CREATE TABLE public.workspace_members(
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    PRIMARY KEY(workspace_id, user_id)
);

-- Projects table
CREATE TABLE public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name text NOT NULL
);

-- Boards table
CREATE TABLE public.boards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name text NOT NULL
);

-- Columns table
CREATE TABLE public.columns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id uuid NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
    name text NOT NULL,
    "position" integer NOT NULL
);

-- Tasks table
CREATE TABLE public.tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    column_id uuid NOT NULL REFERENCES public.columns(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    "position" integer NOT NULL,
    due_date timestamptz
);

-- Tasks Assigness table
CREATE TABLE public.task_assignees (
    task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY(task_id, user_id)
);

-- Tags table
CREATE TABLE public.tags (
    id uuid PRIMARY KEY Default gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name text NOT NULL,
    color text CHECK (color ~ '^#[0-9a-fA-F]{6}$'),

    CONSTRAINT tags_workspace_id_name_key UNIQUE (workspace_id, name)
);

-- Task_Tags table
CREATE TABLE public.task_tags (
    task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE, -- Corrected this line
    PRIMARY KEY (task_id, tag_id)
);





