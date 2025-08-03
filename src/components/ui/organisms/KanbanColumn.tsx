'use client'

import * as React from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/atoms/dialog'
import { Heading } from '@/components/ui/atoms/Heading'
import { AddCommentForm } from '@/components/ui/forms/AddCommentForm'
import { CommentList } from '@/components/ui/molecules/CommentList'
import { TaskCard } from '@/components/ui/molecules/TaskCard'
import { Task } from '@/lib/definations'

interface KanbanColumnProps {
  title: string
  tasks: Task[]
}

function KanbanColumn({ title, tasks }: KanbanColumnProps) {
  return (
    <div className="bg-secondary flex flex-col gap-4 rounded-lg p-4">
      <Heading
        size="h2"
        className="text-secondary-foreground text-lg font-semibold"
      >
        {title}
      </Heading>

      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <Dialog key={task.id}>
            <DialogTrigger asChild>
              <div className="cursor-pointer">
                <TaskCard title={task.title} description={task.description} />
              </div>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{task.title}</DialogTitle>
                {task.description && (
                  <DialogDescription>{task.description}</DialogDescription>
                )}
              </DialogHeader>
              <CommentList comments={task.comments || []} />
              <AddCommentForm task_id={task.id} />
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}

export { KanbanColumn }
