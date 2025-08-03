'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { AddCommentSchema } from '@/lib/zod/schemas'
import { createClient } from '@/utils/supabase/server'

export type AddCommentFormState = {
  success: boolean
  message: string
  errors?: {
    content?: string[]
    task_id?: string[]
    _form?: string[]
  }
}

export async function addCommentAction(
  prevState: AddCommentFormState,
  formData: FormData,
): Promise<AddCommentFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      message: 'Authentication Error: You must be logged in to comment.',
    }
  }

  const rawData = {
    content: formData.get('content'),
    task_id: formData.get('task_id'),
  }
  const validation = AddCommentSchema.safeParse(rawData)
  if (!validation.success) {
    const fieldError = z.flattenError(validation.error).fieldErrors
    return { success: false, message: 'Invalid from data', errors: fieldError }
  }

  const { content, task_id } = validation.data
  const { error } = await supabase.from('comments').insert({
    content: content,
    task_id: task_id,
    user_id: user.id,
  })

  if (error) {
    return {
      success: false,
      message: 'Database Error: Failed to add comment.',
      errors: { _form: [error.message] },
    }
  }

  revalidatePath('/')
  return { success: true, message: 'Comment added successfully.' }
}
