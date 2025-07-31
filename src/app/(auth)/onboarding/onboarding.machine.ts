import { assign, fromPromise, setup } from 'xstate'

import {
  createWorkspaceAction,
  InviteFormState,
  inviteTeammatesAction,
  WorkspaceFormState,
} from './action'
import { InvitesData, WorkspaceData } from './onboarding.schemas'

export type OnboardingContext = {
  workspaceData: WorkspaceData | null
  invitesData: InvitesData | null
  createWorkspaceId: string | null
  stepSuccessMessage: string | null
  finalSuccessMessage: string | null
  error: string | null
}

export type OnboardingEvents =
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SUBMIT_WORKSPACE'; data: WorkspaceData }
  | { type: 'SUBMIT_INVITES'; data: InvitesData }
  | { type: 'SKIP_INVITES' }
  | { type: 'RETRY' }
  | {
      type: 'xstate.done.actor.createWorkspaceActor'
      output: WorkspaceFormState
    }
  | { type: 'xstate.error.actor.createWorkspaceActor'; error: unknown }
  | { type: 'xstate.done.actor.inviteTeammatesActor'; output: InviteFormState }
  | { type: 'xstate.error.actor.inviteTeammatesActor'; error: unknown }

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
    assignCreateWorkspaceId: assign({
      createWorkspaceId: ({ event }) => {
        if (event.type === 'xstate.done.actor.createWorkspaceActor') {
          return event.output.workspaceId ?? null
        }
        return null
      },
    }),
    assignStepSuccessMessage: assign({
      stepSuccessMessage: ({ event }) => {
        if (event.type === 'xstate.done.actor.createWorkspaceActor') {
          return event.output.message
        }
        return null
      },
    }),
    assignFinalSuccessMessage: assign({
      finalSuccessMessage: ({ event }) => {
        if (event.type === 'xstate.done.actor.inviteTeammatesActor') {
          return event.output.message
        }
        return null
      },
    }),
    assignSkipMessage: assign({
      finalSuccessMessage:
        'Workspace created! You can invite teammates later from your workspace settings.',
    }),
    assignError: assign({
      error: ({ event }) => {
        if (
          event.type === 'xstate.error.actor.createWorkspaceActor' ||
          event.type === 'xstate.error.actor.inviteTeammatesActor'
        ) {
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
    inviteTeammatesActor: fromPromise(
      async ({
        input,
      }: {
        input: { data: InvitesData; workspaceId: string }
      }) => {
        const formData = new FormData()
        formData.append('emails', input.data.teammateEmails.join(','))
        formData.append('workspaceId', input.workspaceId)
        const initialState = { success: false, message: '' }
        const result = await inviteTeammatesAction(initialState, formData)
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
    createWorkspaceId: null,
    stepSuccessMessage: null,
    finalSuccessMessage: null,
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
          actions: ['assignCreateWorkspaceId', 'assignStepSuccessMessage'],
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
          target: 'inviting',
          actions: 'assignInvitesData',
        },
        SKIP_INVITES: {
          target: 'success',
          actions: 'assignSkipMessage',
        },
        PREV: {
          target: 'workspace',
        },
      },
    },
    inviting: {
      invoke: {
        id: 'inviteTeammatesActor',
        src: 'inviteTeammatesActor',
        input: ({ context }) => ({
          data: context.invitesData as InvitesData,
          workspaceId: context.createWorkspaceId as string,
        }),
        onDone: {
          target: 'success',
          actions: 'assignFinalSuccessMessage',
        },
        onError: {
          target: 'error',
          actions: 'assignError',
        },
      },
    },
    success: { type: 'final' },
    error: {
      on: {
        RETRY: {
          target: 'workspace',
        },
      },
    },
  },
})
