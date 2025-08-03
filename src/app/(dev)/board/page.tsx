'use client'
import { useQuery } from '@tanstack/react-query'

import { KanbanBoard } from '@/components/ui/organisms/KanbanBoard'
import { getBoardData } from '@/lib/actions/board.actions'

export default function BoardDevPage() {
  const {
    data: boardData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['board-data'],
    queryFn: getBoardData,
  })

  return (
    <div className="bg-background min-h-screen p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Kanban Board (Development View)</h1>
        <p className="text-muted-foreground">
          This page now fetches live data from the database.
        </p>
      </header>

      <main>
        {isLoading && <p>Loading board data...</p>}
        {isError && (
          <p className="text-destructive">
            Error fetching board: {error.message}
          </p>
        )}

        {boardData && <KanbanBoard boardData={boardData} />}
      </main>
    </div>
  )
}
