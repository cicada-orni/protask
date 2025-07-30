'use client'

import { useMachine } from '@xstate/react'
import * as React from 'react'

import { Button } from '@/components/ui/atoms/button'
import { Heading } from '@/components/ui/atoms/Heading'
import { Input } from '@/components/ui/atoms/input'

import { onboardingMachine } from './onboarding.machine'
import { WorkspaceSchema } from './onboarding.schemas'

export default function OnboardingPage() {
  const [state, send] = useMachine(onboardingMachine)

  const serverError = state.context.error

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const rawData = {
      workspaceName: formData.get('workspaceName') as string,
    }

    const validation = WorkspaceSchema.safeParse(rawData)

    if (validation.success) {
      send({ type: 'SUBMIT_WORKSPACE', data: validation.data })
    } else {
      return 'Unexpected Error'
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border p-8 shadow-lg">
        <Heading as="h1" size="h2" className="mb-4 text-center">
          {state.matches('welcome') && 'Welcome to ProTask!'}
          {state.matches('workspace') && 'Create Your Workspace'}
          {state.matches('creating') && 'Setting Up Your Workspace...'}
          {state.matches('invites') && 'Invite Your Teammates'}
          {state.matches('error') && 'Something Went Wrong'}
          {state.matches('success') && 'Setup Complete!'}
        </Heading>

        <div className="mt-8 min-h-[150px]">
          {state.matches('welcome') && (
            <div className="space-y-3 text-center">
              <p className="text-muted-foreground">
                Let&apos;s get your first workspace set up in just a few steps.
              </p>
              <Button type="button" onClick={() => send({ type: 'NEXT' })}>
                Get Started
              </Button>
            </div>
          )}

          {state.matches('workspace') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="workspaceName" className="text-sm font-medium">
                  Workspace Name
                </label>
                <Input
                  type="text"
                  id="workspaceName"
                  name="workspaceName"
                  placeholder="Acme Inc."
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Continue</Button>
              </div>
            </form>
          )}

          {state.matches('creating') && (
            <div className="text-center">
              <p className="text-muted-foreground">Please wait...</p>
            </div>
          )}

          {state.matches('invites') && (
            <div className="text-center">
              <p>Workspace created! Now, let&apos;s invite your team.</p>
            </div>
          )}

          {state.matches('error') && (
            <div className="space-y-4 text-center">
              <p className="text-destructive">{serverError}</p>
              <Button onClick={() => send({ type: 'RETRY' })}>Retry</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
