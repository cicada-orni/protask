'use server'
import { z } from 'zod'

import { createClient } from '@/utils/supabase/server'

import { InvitesSchema, WorkspaceSchema } from './onboarding.schemas'

export type WorkspaceFormState = {
  success: boolean
  message: string
  workspaceId?: string
}

export type InviteFormState = {
  success: boolean
  message: string
  errors?: {
    emails?: string[]
    _form?: string
  }
}

// ------------- CREATE WORKSPACE ACTION ----------------
export async function createWorkspaceAction(
  prevState: WorkspaceFormState,
  formData: FormData,
): Promise<WorkspaceFormState> {
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
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: 'admin' as const,
    })

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

// ------------- CREATE INVITES ACTION ----------------

export async function inviteTeammatesAction(
  prevState: InviteFormState,
  formData: FormData,
): Promise<InviteFormState> {
  const supabase = await createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  if (!currentUser) {
    return {
      success: false,
      message: 'Authentication error: Current user not found.',
    }
  }

  const rawData = {
    emails: formData.get('emails') as string,
    workspaceId: formData.get('workspaceId') as string,
  }

  const emailsArray = rawData.emails
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)

  const validation = InvitesSchema.safeParse({
    teammateEmails: emailsArray,
  })

  if (!validation.success) {
    const fieldErrors = z.flattenError(validation.error).fieldErrors
    const firstError = fieldErrors.teammateEmails?.[0]
    return {
      success: false,
      message:
        firstError ||
        'Validation failed. Please provide a list of valid emails.',
      errors: {
        emails: fieldErrors.teammateEmails,
      },
    }
  }

  if (validation.data.teammateEmails.length === 0) {
    return { success: true, message: 'Skipped inviting teammates.' }
  }

  const { data: users, error: usersError } = await supabase.rpc(
    'search_users_by_email',
    { email_list: validation.data.teammateEmails },
  )

  if (usersError) {
    console.error('Database Error:', usersError)
    return {
      success: false,
      message: 'Error finding users. Please try again.',
    }
  }

  if (users.length === 0) {
    return {
      success: false,
      message:
        'No users found with the provided emails. Please check the addresses and try again.',
    }
  }

  const membersToInsert = users
    .map((user: { id: string; email: string }) => {
      return {
        workspace_id: rawData.workspaceId,
        user_id: user.id,
        role: 'member' as const,
      }
    })
    .filter((member: { user_id: string }) => member.user_id !== currentUser.id)

  if (membersToInsert.length === 0) {
    return {
      success: true,
      message: 'All users provided are already part of the workspace',
    }
  }

  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert(membersToInsert)

  if (memberError) {
    console.error('Failed to insert members:', memberError)
    return {
      success: false,
      message: 'Failed to add members to the workspace. Please try again.',
    }
  }
  let successMessage = `${membersToInsert.length} member(s) have been invited successfully.`
  if (membersToInsert.length < validation.data.teammateEmails.length) {
    const foundEmails = users.map(
      (user: { id: string; email: string }) => user.email,
    )
    const notFoundEmails = validation.data.teammateEmails.filter(
      (email) => !foundEmails.includes(email),
    )
    if (notFoundEmails.length > 0) {
      successMessage += ` The following emails were not found: ${notFoundEmails.join(', ')}`
    }
  }

  return {
    success: true,
    message: successMessage,
  }
}
