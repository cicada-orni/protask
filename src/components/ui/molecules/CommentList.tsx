'use client'
import { Comment } from '@/lib/definations'

type CommentListProps = {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
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
          <p className="text-sm">{comment.content}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {new Date(comment.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}
