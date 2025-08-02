// prisma/seed.ts
import { faker } from '@faker-js/faker'
import { createClient } from '@supabase/supabase-js'

import { PrismaClient } from '@/generated/prisma'

// --- CONFIGURATION ---
// 1. PASTE YOUR GENERATED UUID HERE
const SEED_USER_ID = '2ecd4345-4e0d-41d0-86ca-6458aa0e8b07'

const SEED_USER_EMAIL = 'testuser@protask.com'
const SEED_USER_PASSWORD = 'password123'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables in .env file.')
}

// --- INITIALIZATION ---
const prisma = new PrismaClient()
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

async function main() {
  console.log('🌱 Starting seed process...')

  // --- CLEANUP PHASE ---
  console.log('🧹 Deleting existing public data...')
  // Order is important due to foreign key constraints
  await prisma.task_assignees.deleteMany()
  await prisma.task_tags.deleteMany()
  await prisma.tags.deleteMany()
  await prisma.tasks.deleteMany()
  await prisma.columns.deleteMany()
  await prisma.boards.deleteMany()
  await prisma.projects.deleteMany()
  await prisma.workspace_members.deleteMany()
  await prisma.workspaces.deleteMany()
  console.log('🗑️ Public data deleted.')

  // --- USER CREATION (IDEMPOTENT) ---
  // 2. Try to delete the user if they exist. We expect this to fail on the first run.
  console.log(`🧼 Attempting to clean up user ${SEED_USER_EMAIL}...`)
  try {
    await supabaseAdmin.auth.admin.deleteUser(SEED_USER_ID)
    console.log(`🗑️ Deleted existing user.`)
  } catch (error: any) {
    if (error.message.includes('User not found')) {
      console.log('No existing user found. This is expected on the first run.')
    } else {
      console.error('Error deleting user:', error.message)
      throw error
    }
  }

  // 3. Create the user with our predefined, static ID.
  console.log(`👤 Creating seed user with static ID...`)
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      id: SEED_USER_ID,
      email: SEED_USER_EMAIL,
      password: SEED_USER_PASSWORD,
      email_confirm: true, // Auto-confirm the email for convenience
    })

  if (authError || !authData.user) {
    console.error('Error creating seed user:', authError?.message)
    throw authError || new Error('User creation failed.')
  }
  console.log(`✅ Seed user created successfully.`)

  // --- DATA SEEDING PHASE ---
  // 4. Create the workspace and all nested data in a single transaction.
  console.log(`🏢 Creating workspace for user ${SEED_USER_ID}...`)
  const workspace = await prisma.workspaces.create({
    data: {
      name: `ProTask Workspace`,
      owner_id: SEED_USER_ID,
      workspace_members: {
        create: { user_id: SEED_USER_ID, role: 'admin' },
      },
      projects: {
        create: {
          name: 'My First Project',
          boards: {
            create: {
              name: 'Kanban Board',
              columns: {
                create: [
                  {
                    name: 'To Do',
                    position: 0,
                    tasks: {
                      create: Array.from({ length: 3 }, (_, i) => ({
                        title: faker.lorem.sentence(5),
                        description: faker.lorem.paragraph(),
                        position: i,
                      })),
                    },
                  },
                  {
                    name: 'In Progress',
                    position: 1,
                    tasks: {
                      create: Array.from({ length: 2 }, (_, i) => ({
                        title: faker.lorem.sentence(5),
                        description: faker.lorem.paragraph(),
                        position: i,
                      })),
                    },
                  },
                  { name: 'Done', position: 2 },
                ],
              },
            },
          },
        },
      },
    },
  })
  console.log(`✅ Workspace "${workspace.name}" and all related data created.`)
  console.log('🌱 Seed process finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
