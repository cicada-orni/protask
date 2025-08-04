'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/atoms/button'
import { deleteComment } from '@/lib/actions/comment.actions'
import { Comment } from '@/lib/definations'

type CommentListProps = {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
  const queryClient = useQueryClient()
  const { mutate: deleteCommentMutation, isPending } = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-data'] })
    },
  })
  if (comments.length === 0) {
    return (
      <p className="text-muted-foreground mt-4 text-center text-sm">
        No comments yet.
      </p>
    )
  }

  return (
    <div className="mt-4 space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-secondary rounded-lg p-3">
          <div>
            <p className="text-sm">{comment.content}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </div>
          {/* Delete button */}
          <Button
            variant="ghost"
            disabled={isPending}
            size="icon"
            className="size-7 shrink-0"
            onClick={() => deleteCommentMutation(comment.id)}
          >
            <Trash2 className="text-muted-foreground hover:text-destructive size-4 transition-colors" />
          </Button>
        </div>
      ))}
    </div>
  )
}
