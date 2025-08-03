'use server'
import 'server-only'

import { createClient } from '@/utils/supabase/server'

export async function getBoardData() {
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
