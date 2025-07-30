import { assign, fromPromise, setup } from 'xstate'

import { createWorkspaceAction, FormState } from './action'
import { InvitesData, WorkspaceData } from './onboarding.schemas'

export type OnboardingContext = {
  workspaceData: WorkspaceData | null
  invitesData: InvitesData | null
  error: string | null
}

export type OnboardingEvents =
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SUBMIT_WORKSPACE'; data: WorkspaceData }
  | { type: 'SUBMIT_INVITES'; data: InvitesData }
  | { type: 'RETRY' }
  | { type: 'xstate.done.actor.createWorkspaceActor'; output: FormState }
  | { type: 'xstate.error.actor.createWorkspaceActor'; error: unknown }

export const onboardingMachine = setup({
  types: {
    context: {} as OnboardingContext,
    events: {} as OnboardingEvents,
  },
  actions: {
    assignWorkspaceData: assign({
      workspaceData: ({ event }) => {
        if (event.type === 'SUBMIT_WORKSPACE') {
          return event.data as WorkspaceData
        }
        return null
      },
    }),
    assignInvitesData: assign({
      invitesData: ({ event }) => {
        if (event.type === 'SUBMIT_INVITES') {
          return event.data as InvitesData
        }
        return null
      },
    }),
    assignError: assign({
      error: ({ event }) => {
        if (event.type === 'xstate.error.actor.createWorkspaceActor') {
          if (event.error instanceof Error) {
            return event.error.message
          }
          return 'An unexpected error occurred.'
        }
        return null
      },
    }),
  },
  actors: {
    createWorkspaceActor: fromPromise(
      async ({ input }: { input: { data: WorkspaceData } }) => {
        const formData = new FormData()
        formData.append('workspaceName', input.data.workspaceName)
        const initialState = {
          success: false,
          message: '',
        }
        const result = await createWorkspaceAction(initialState, formData)
        if (!result.success) {
          throw new Error(result.message)
        }
        return result
      },
    ),
  },
}).createMachine({
  id: 'onboarding',
  initial: 'welcome',
  context: {
    workspaceData: null,
    invitesData: null,
    error: null,
  },
  states: {
    welcome: {
      on: {
        NEXT: {
          target: 'workspace',
        },
      },
    },
    workspace: {
      on: {
        SUBMIT_WORKSPACE: {
          target: 'creating',
          actions: 'assignWorkspaceData',
        },
        PREV: {
          target: 'welcome',
        },
      },
    },
    creating: {
      invoke: {
        id: 'createWorkspaceActor',
        src: 'createWorkspaceActor',
        input: ({ context }) => ({
          data: context.workspaceData as WorkspaceData,
        }),
        onDone: {
          target: 'invites',
        },
        onError: {
          target: 'error',
          actions: 'assignError',
        },
      },
    },
    invites: {
      on: {
        SUBMIT_INVITES: {
          target: 'creating',
          actions: 'assignInvitesData',
        },
        PREV: {
          target: 'workspace',
        },
      },
    },
    success: { type: 'final' },
    error: {
      on: {
        RETRY: {
          target: 'creating',
        },
      },
    },
  },
})
