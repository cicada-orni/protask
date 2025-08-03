'use client'
import { useActionState, useEffect, useRef } from 'react'

import { Button } from '@/components/ui/atoms/button'
import { Input } from '@/components/ui/atoms/input'
import { Textarea } from '@/components/ui/atoms/textarea'
import {
  addCommentAction,
  AddCommentFormState,
} from '@/lib/actions/comment.actions'

type AddCommentFormProps = {
  task_id: string
}

const initialState: AddCommentFormState = {
  success: false,
  message: '',
}
export function AddCommentForm({ task_id }: AddCommentFormProps) {
  const [state, formAction] = useActionState(addCommentAction, initialState)

  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  return (
    <form ref={formRef} action={formAction} className="mt-4 space-y-4">
      <div>
        <Input type="hidden" name="task_id" value={task_id} />
        <Textarea
          name="content"
          placeholder="Add a comment..."
          required
          className="min-h-[60px]"
        />
        {state.errors?.content && (
          <p className="text-destructive mt-1 text-sm">
            {state.errors.content.join(', ')}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="sm">
          Comment
        </Button>
      </div>
      {!state.success && state.message && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}

      {state.success && state.message && (
        <p className="text-sm text-green-500">{state.message}</p>
      )}
    </form>
  )
}
