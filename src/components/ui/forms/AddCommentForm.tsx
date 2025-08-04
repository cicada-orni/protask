'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Button } from '@/components/ui/atoms/button'
import { Textarea } from '@/components/ui/atoms/textarea'
import { addComment } from '@/lib/actions/comment.actions'
import { BoardData, Comment } from '@/lib/definations'

type AddCommentFormProps = {
  task_id: string
}

type InputForm = {
  content: string
  task_id: string
}

export function AddCommentForm({ task_id }: AddCommentFormProps) {
  const [content, setContent] = React.useState('')
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: (variables: InputForm) => addComment(variables),
    onMutate: async (variables: InputForm) => {
      await queryClient.cancelQueries({ queryKey: ['board-data'] })
      const previousBoardData = queryClient.getQueryData<BoardData>([
        'board-data',
      ])

      queryClient.setQueryData<BoardData>(['board-data'], (oldData) => {
        if (!oldData) {
          return []
        }

        const newData = oldData.map((column) => {
          const taskToUpdate = column.tasks.find((task) => task.id === task_id)

          if (!taskToUpdate) {
            return column
          }

          const newComment: Comment = {
            id: uuidv4(),
            content: variables.content,
            created_at: new Date().toISOString(),
          }

          const newTasks = column.tasks.map((task) => {
            if (task.id === task_id) {
              return {
                ...task,
                comments: [...task.comments, newComment],
              }
            }
            return task
          })

          return {
            ...column,
            tasks: newTasks,
          }
        })

        return newData
      })

      return { previousBoardData }
    },
    onError: (err, variables, context) => {
      console.error('Mutation failed:', err)
      if (context?.previousBoardData) {
        queryClient.setQueryData<BoardData>(
          ['board-data'],
          context.previousBoardData,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board-data'] })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!content.trim()) return
    mutate({ content, task_id })
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <Textarea
        name="content"
        placeholder="Add a comment..."
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Commenting...' : 'Comment'}
        </Button>
      </div>
    </form>
  )
}
