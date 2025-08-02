'use client'

import { KanbanBoard } from '@/components/ui/organisms/KanbanBoard'

const MOCK_BOARD_DATA = [
  {
    id: 'col-1',
    title: 'To Do',
    tasks: [
      {
        id: 'task-1',
        title: 'Design the new login page',
        description: 'Create a Figma mockup for the new login page UI.',
      },
      {
        id: 'task-2',
        title: 'Develop the API endpoint for tasks',
        description:
          'Use Node.js and Express to create the /api/tasks endpoint.',
      },
    ],
  },
  {
    id: 'col-2',
    title: 'In Progress',
    tasks: [
      {
        id: 'task-3',
        title: 'Implement the new Button component',
        description: 'Build the reusable Button atom in React and Storybook.',
      },
    ],
  },
  {
    id: 'col-3',
    title: 'Done',
    tasks: [
      {
        id: 'task-4',
        title: 'Set up the project repository',
        description:
          'Initialize the Git repo and configure ESLint and Prettier.',
      },
    ],
  },
]

export default function BoardDevPage() {
  return (
    <div className="bg-background min-h-screen p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Kanban Board (Development View)</h1>
        <p className="text-muted-foreground">
          This is a static, mocked version of the board for UI development.
        </p>
      </header>
      <main>
        <KanbanBoard boardData={MOCK_BOARD_DATA} />
      </main>
    </div>
  )
}
