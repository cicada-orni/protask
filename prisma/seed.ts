// prisma/seed.ts

import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This is the ID of the user you will create manually in the Supabase UI.
// Go to Authentication -> Users -> Create User, then copy the ID here.
const SEED_USER_ID = 'YOUR_MANUAL_USER_ID_HERE' // 👈 **IMPORTANT: REPLACE THIS**

async function main() {
  if (!SEED_USER_ID || SEED_USER_ID === 'YOUR_MANUAL_USER_ID_HERE') {
    console.error(
      '❌ Please replace YOUR_MANUAL_USER_ID_HERE with a real user ID.'
    )
    process.exit(1)
  }

  console.log('🌱 Starting seed process...')

  // Clean up existing workspace data
  console.log('🧹 Clearing existing workspace data...')
  await prisma.task_tags.deleteMany()
  await prisma.task_assignees.deleteMany()
  await prisma.tags.deleteMany()
  await prisma.tasks.deleteMany()
  await prisma.columns.deleteMany()
  await prisma.boards.deleteMany()
  await prisma.projects.deleteMany()
  await prisma.workspace_members.deleteMany()
  await prisma.workspaces.deleteMany()
  console.log('🧹 Workspace data cleared.')

  // Create a Workspace for the seed user
  console.log('🏢 Creating a workspace...')
  const workspace = await prisma.workspaces.create({
    data: {
      name: `My ProTask Workspace`,
    },
  })

  // Assign the seed user as the admin of the workspace
  await prisma.workspace_members.create({
    data: {
      workspace_id: workspace.id,
      user_id: SEED_USER_ID,
      role: 'admin',
    },
  })
  console.log(`🏢 Workspace created and user ${SEED_USER_ID} assigned as admin.`)

  // Create a Project within the workspace
  console.log('📂 Creating a project...')
  const project = await prisma.projects.create({
    data: {
      workspace_id: workspace.id,
      name: 'My First Project',
    },
  })

  // Create a Board within the project
  console.log('📋 Creating a board...')
  const board = await prisma.boards.create({
    data: {
      project_id: project.id,
      name: 'Kanban Board',
    },
  })

  // Create Columns for the board
  console.log('📊 Creating columns...')
  const todoColumn = await prisma.columns.create({
    data: { board_id: board.id, name: 'To Do', position: 0 },
  })
  const inProgressColumn = await prisma.columns.create({
    data: { board_id: board.id, name: 'In Progress', position: 1 },
  })
  const doneColumn = await prisma.columns.create({
    data: { board_id: board.id, name: 'Done', position: 2 },
  })
  console.log('📊 Columns created.')

  // Create Tasks for the "To Do" column
  console.log('📝 Creating tasks...')
  for (let i = 0; i < 5; i++) {
    await prisma.tasks.create({
      data: {
        column_id: todoColumn.id,
        title: faker.lorem.sentence(4),
        description: faker.lorem.paragraph(),
        position: i,
      },
    })
  }
  console.log('📝 Tasks created.')
  console.log('✅ Seed process finished successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })