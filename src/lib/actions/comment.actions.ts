'use server'

import 'server-only'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/utils/supabase/server'

type AddCommentArgs = {
  content: string
  task_id: string
}

// INSERT COMMENT

export async function addComment({ content, task_id }: AddCommentArgs) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Authentication Error: You must be logged in to comment')
  }

  if (!content || content.trim().length === 0) {
    throw new Error('Validation Error: Comment cannot be empty')
  }
  if (!task_id) {
    throw new Error('Validation Error: Task ID is required.')
  }

  const { data, error } = await supabase.from('comments').insert({
    content: content,
    task_id: task_id,
    user_id: user.id,
  })
  if (error) {
    console.error('Database Error:', error)
    throw new Error('Database Error: Failed to add comment.')
  }

  revalidatePath('/')
  return data
}

// DELETE COMMENT

export async function deleteComment(comment_id: string) {
  if (!comment_id) {
    throw new Error('Validation Error: Comment ID is required.')
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error(
      'Authentication Error: You must be logged in to delete a comment.',
    )
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', comment_id)

  if (error) {
    console.error('Database Error:', error)
    throw new Error('Database Error: Failed to delete comment.')
  }

  revalidatePath(`/`)
  return { success: true, message: 'Comment deleted successfully.' }
}
