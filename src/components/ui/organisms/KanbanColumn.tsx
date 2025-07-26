import * as React from 'react'

import { Heading } from '@/components/ui/atoms/Heading'
import { TaskCard } from '@/components/ui/molecules/TaskCard'

interface Task {
  id: string
  title: string
}

//prop type for our KanbanColumn component.
interface KanbanColumnProps {
  title: string
  tasks: Task[]
}

function KanbanColumn({ title, tasks }: KanbanColumnProps) {
  return (
    <div className="bg-secondary flex flex-col gap-4 rounded-lg p-4">
      {/* Column Title */}
      <Heading
        size="h2"
        className="text-secondary-foreground text-lg font-semibold"
      >
        {title}
      </Heading>

      {/* Task Cards Container */}
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} title={task.title} />
        ))}
      </div>
    </div>
  )
}

export { KanbanColumn }
