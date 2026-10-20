import { useRef, useState } from "react"
import { ShieldKey } from "@keyline-icons/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldDescription,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

function GoogleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function getEmailError(input: HTMLInputElement) {
  if (input.validity.valueMissing) {
    return "Enter your email address."
  }
  if (input.validity.typeMismatch) {
    return "Enter a valid email, like name@school.edu."
  }
}

export function LoginForm({
  className,
  defaultEmail,
  pending = false,
  onEmailSubmit,
  ...props
}: React.ComponentProps<"div"> & {
  defaultEmail?: string
  pending?: boolean
  onEmailSubmit?: (email: string) => void
}) {
  const emailRef = useRef<HTMLInputElement>(null)
  const [emailError, setEmailError] = useState<string>()

  return (
    <div
      className={cn("flex w-full flex-col items-center gap-7", className)}
      {...props}
    >
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Welcome to codebalt
        </h1>
        <p className="text-sm text-balance text-muted-foreground">
          Your all-in-one digital CS classroom.
        </p>
      </div>
      <form
        className="w-full max-w-xs"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const input = emailRef.current
          if (!input) return
          const error = getEmailError(input)
          setEmailError(error)
          if (error) {
            input.focus()
            return
          }
          onEmailSubmit?.(input.value)
        }}
      >
        <FieldGroup>
          <Field>
            <Button variant="outline" type="button">
              <GoogleIcon data-icon="inline-start" />
              Continue with Google
            </Button>
            <Button variant="outline" type="button">
              <ShieldKey data-icon="inline-start" />
              Sign in with passkey
            </Button>
          </Field>
          <FieldSeparator />
          <Field data-invalid={Boolean(emailError)}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              placeholder="Type your email"
              autoComplete="email"
              defaultValue={defaultEmail}
              autoFocus={Boolean(defaultEmail)}
              required
              aria-invalid={Boolean(emailError)}
              aria-describedby={
                emailError ? "email-error" : "email-description"
              }
              onChange={() => setEmailError(undefined)}
            />
            {emailError ? (
              <FieldError id="email-error">{emailError}</FieldError>
            ) : (
              <FieldDescription id="email-description">
                We&apos;ll send you a code on the next screen.
              </FieldDescription>
            )}
          </Field>
          <Field>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner data-icon="inline-start" />}
              {pending ? "Sending code…" : "Continue with email"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
