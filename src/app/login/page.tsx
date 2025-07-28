'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { Button } from '@/components/ui/atoms/button'
import { Heading } from '@/components/ui/atoms/Heading'
import { Input } from '@/components/ui/atoms/input'
import { LoginState } from '@/lib/definations'

import { login } from './actions'

const initialState: LoginState = {
  message: '',
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initialState)
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="border-border bg-card w-full max-w-md rounded-lg border p-8 shadow-lg">
        <div className="mb-8 text-center">
          <Heading as="h1" size="h2" className="text-foreground">
            Welcome Back
          </Heading>
          <p className="text-muted-foreground mt-2">
            Sign in to continue to ProTask
          </p>
        </div>

        <form className="space-y-6" action={formAction}>
          <div className="flex flex-col space-y-1">
            <label
              htmlFor="email"
              className="text-foreground text-sm font-medium"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              className="w-full"
              aria-invalid={!!state.errors?.email}
            />
            {state.errors?.email && (
              <p className="mt-1 text-xs text-red-500">
                {state.errors?.email.join(', ')}
              </p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label
              htmlFor="password"
              className="text-foreground text-sm font-medium"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full"
              aria-invalid={!!state.errors?.password}
            />
            {state.errors?.password && (
              <p className="mt-1 text-xs text-red-500">
                {state.errors?.password.join(', ')}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
