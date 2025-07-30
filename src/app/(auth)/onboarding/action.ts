'use server'
import { createClient } from '@/utils/supabase/server'

import { WorkspaceSchema } from './onboarding.schemas'

export type FormState = {
  success: boolean
  message: string
  workspaceId?: string
}

export async function createWorkspaceAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient()

  const rawData = {
    workspaceName: formData.get('workspaceName'),
  }
  const validation = WorkspaceSchema.safeParse(rawData)
  if (!validation.success) {
    return {
      success: false,
      message:
        'Validation failed. Workspace name must be at least 3 characters',
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Authenication error: User not found' }
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({ name: validation.data.workspaceName, owner_id: user.id })
    .select('id')
    .single()

  if (workspaceError) {
    return {
      success: false,
      // We are now sending the raw database error message back to the UI.
      message: `Database Error: ${workspaceError.message}`,
    }
  }

  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({ workspace_id: workspace.id, user_id: user.id, role: 'admin' })

  if (memberError) {
    return {
      success: false,
      message: 'Failed to assign user to workspace. Please contact support.',
    }
  }
  return {
    success: true,
    message: `Workspace "${validation.data.workspaceName}" created successfully`,
    workspaceId: workspace.id,
  }
}
