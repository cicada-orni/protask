import * as React from 'react'

import { KanbanColumn } from './KanbanColumn'

// Define the shape of our data for the entire board
interface Task {
  id: string
  title: string
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

interface KanbanBoardProps {
  boardData: Column[]
}

function KanbanBoard({ boardData }: KanbanBoardProps) {
  return (
    <div className="flex gap-6 p-4">
      {boardData.map((column) => (
        <div key={column.id} className="w-80 shrink-0">
          <KanbanColumn title={column.title} tasks={column.tasks} />
        </div>
      ))}
    </div>
  )
}

export { KanbanBoard }
