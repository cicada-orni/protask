'use server'
import 'server-only'

import { createClient } from '@/utils/supabase/server'

import { BoardData } from '../definations'

export async function getBoardData(): Promise<BoardData> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('boards')
    .select(
      `
    id,
    name,
    columns(
        id,
        title:name,
        tasks(
            id,
            title,
            description,
            comments(
              id,
              content,
              created_at
            )
        )
    )
    `,
    )
    .eq('name', 'Kanban Board')
    .single()

  if (error) {
    console.log('Error fetching board data,', error)
    throw new Error('Failed to fetch board data from the database.')
  }

  return data.columns
}
