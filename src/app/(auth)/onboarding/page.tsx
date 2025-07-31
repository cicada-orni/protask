// src/app/(auth)/onboarding/page.tsx
'use client'

import { useMachine } from '@xstate/react'
import { CheckCircle2, RocketIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { z } from 'zod'

import { Button } from '@/components/ui/atoms/button'
import { Heading } from '@/components/ui/atoms/Heading'
import { Input } from '@/components/ui/atoms/input'
import { Textarea } from '@/components/ui/atoms/textarea'

import { onboardingMachine } from './onboarding.machine'
import { InvitesSchema, WorkspaceSchema } from './onboarding.schemas'

export default function OnboardingPage() {
  const [state, send] = useMachine(onboardingMachine)
  const [clientError, setClientError] = React.useState<string | null>(null)

  const [invites, setInvites] = React.useState('')
  const [invitesClientError, setInvitesClientError] = React.useState<
    string | null
  >(null)
  const router = useRouter()
  const serverError = state.context.error

  React.useEffect(() => {
    if (state.matches('success')) {
      const timer = setTimeout(() => {
        router.push('/')
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [state, router])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setClientError(null)
    const formData = new FormData(e.currentTarget)
    const rawData = {
      workspaceName: formData.get('workspaceName') as string,
    }

    const validation = WorkspaceSchema.safeParse(rawData)

    if (validation.success) {
      send({ type: 'SUBMIT_WORKSPACE', data: validation.data })
    } else {
      const fieldErrors = z.flattenError(validation.error).fieldErrors
      const errorMessage = fieldErrors.workspaceName?.[0]
      setClientError(errorMessage ?? 'Invalid input')
    }
  }

  const handleSubmitInvites = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setInvitesClientError(null)
    const emailsArray = invites
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean)

    const validation = InvitesSchema.safeParse({
      teammateEmails: emailsArray,
    })
    if (validation.success) {
      send({ type: 'SUBMIT_INVITES', data: validation.data })
    } else {
      const fieldErrors = validation.error.flatten().fieldErrors
      const errorMessage =
        fieldErrors.teammateEmails?.find((msg) => msg) ??
        'Invalid email address'
      setInvitesClientError(errorMessage)
    }
  }

  return (
    <div className="dark flex min-h-screen">
      <div className="bg-secondary hidden flex-col items-center justify-center p-8 text-center lg:flex lg:w-1/2">
        <div className="flex items-center gap-2">
          <RocketIcon className="text-primary size-8" />
          <h1 className="text-primary text-3xl font-bold">ProTask</h1>
        </div>
        <p className="text-muted-foreground mt-4 max-w-sm">
          The final step before you can start organizing your work and
          collaborating with your team.
        </p>
      </div>

      <div className="flex w-full items-center justify-center p-4 lg:w-1/2">
        <div className="w-full max-w-md">
          <Heading as="h1" size="h2" className="mb-4 text-center">
            {state.matches('welcome') && 'Welcome to ProTask!'}
            {state.matches('workspace') && 'Create Your Workspace'}
            {state.matches('creating') && 'Setting Up Your Workspace...'}
            {state.matches('invites') && 'Invite Your Teammates'}
            {state.matches('error') && 'Something Went Wrong'}
            {state.matches('success') && 'Setup Complete!'}
          </Heading>

          <div className="bg-card text-card-foreground mt-8 min-h-[150px] rounded-lg border p-8 shadow-lg">
            {state.matches('welcome') && (
              <div className="space-y-4 text-center">
                <p className="text-muted-foreground">
                  Let&apos;s get your first workspace set up in just a few
                  steps.
                </p>
                <Button type="button" onClick={() => send({ type: 'NEXT' })}>
                  Get Started
                </Button>
              </div>
            )}

            {state.matches('workspace') && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="workspaceName"
                    className="text-sm font-medium"
                  >
                    Workspace Name
                  </label>
                  <Input
                    type="text"
                    id="workspaceName"
                    name="workspaceName"
                    placeholder="Acme Inc."
                    required
                    aria-invalid={!!clientError}
                  />
                  {clientError && (
                    <p className="text-destructive text-sm">{clientError}</p>
                  )}
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
              <div className="flex flex-col space-y-4">
                {state.context.stepSuccessMessage && (
                  <div className="bg-secondary rounded-md border p-3">
                    <p className="text-secondary-foreground text-center text-sm">
                      {state.context.stepSuccessMessage}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmitInvites} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="emails" className="text-sm font-medium">
                      Invite Teammates by Email
                    </label>
                    <p className="text-muted-foreground text-sm">
                      Enter emails separated by commas.
                    </p>
                    <Textarea
                      id="emails"
                      name="emails"
                      placeholder="teammate1@example.com, teammate2@example.com"
                      value={invites}
                      onChange={(e) => setInvites(e.target.value)}
                      aria-invalid={!!invitesClientError}
                      rows={3}
                    />
                    {invitesClientError && (
                      <p className="text-destructive text-sm">
                        {invitesClientError}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => send({ type: 'SKIP_INVITES' })}
                    >
                      Skip for now
                    </Button>
                    <Button type="submit" disabled={state.matches('inviting')}>
                      {state.matches('inviting')
                        ? 'Sending...'
                        : 'Send Invites'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {state.matches('inviting') && (
              <div className="text-center">
                <p className="text-muted-foreground">Sending invites...</p>
              </div>
            )}

            {state.matches('success') && (
              <div className="flex flex-col items-center space-y-4 text-center">
                <CheckCircle2 className="size-12 text-green-500" />
                <p className="text-muted-foreground">
                  {state.context.finalSuccessMessage ||
                    'Your workspace is ready!'}
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to your dashboard...
                </p>
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
    </div>
  )
}
