import { useEffect, useRef, useState } from "react"
import { ArrowLeft } from "@keyline-icons/react"
import { cn } from "cn"
import { REGEXP_ONLY_DIGITS } from "input-otp"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 30

export function VerifyEmailForm({
  className,
  email,
  error,
  pending = false,
  onBack,
  onCodeChange,
  onResend,
  onVerify,
  ...props
}: React.ComponentProps<"div"> & {
  email: string
  error?: string
  pending?: boolean
  onBack: () => void
  onCodeChange?: (code: string) => void
  onResend?: () => void
  onVerify?: (code: string) => void
}) {
  const codeRef = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState("")
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS)
  const invalid = Boolean(error)
  const slotProps = {
    "aria-invalid": invalid,
    className: "h-10 flex-1 text-base",
  }

  useEffect(() => {
    if (error) codeRef.current?.focus()
  }, [error])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  return (
    <div
      className={cn("flex w-full flex-col items-center gap-7", className)}
      {...props}
    >
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          You've got mail.
        </h1>
        <p className="text-sm text-balance text-muted-foreground">
          We sent a {CODE_LENGTH}-digit code to{" "}
          <span className="font-medium break-all text-foreground">{email}</span>
          . Enter it below to continue.
        </p>
      </div>
      <form
        className="w-full max-w-xs"
        onSubmit={(event) => {
          event.preventDefault()
          onVerify?.(code)
        }}
      >
        <FieldGroup>
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor="otp">Verification code</FieldLabel>
            <InputOTP
              ref={codeRef}
              id="otp"
              maxLength={CODE_LENGTH}
              pattern={REGEXP_ONLY_DIGITS}
              value={code}
              onChange={(value) => {
                setCode(value)
                onCodeChange?.(value)
              }}
              autoFocus
              required
              aria-invalid={invalid}
              aria-describedby={invalid ? "otp-error" : undefined}
            >
              <InputOTPGroup className="flex-1">
                <InputOTPSlot index={0} {...slotProps} />
                <InputOTPSlot index={1} {...slotProps} />
                <InputOTPSlot index={2} {...slotProps} />
              </InputOTPGroup>
              <InputOTPSeparator className="px-1 text-muted-foreground" />
              <InputOTPGroup className="flex-1">
                <InputOTPSlot index={3} {...slotProps} />
                <InputOTPSlot index={4} {...slotProps} />
                <InputOTPSlot index={5} {...slotProps} />
              </InputOTPGroup>
            </InputOTP>
            {error && <FieldError id="otp-error">{error}</FieldError>}
            <FieldDescription>
              Didn&apos;t get the email?{" "}
              <Button
                variant="link"
                type="button"
                className="h-auto p-0 text-sm"
                disabled={secondsLeft > 0}
                onClick={() => {
                  onResend?.()
                  setSecondsLeft(RESEND_COOLDOWN_SECONDS)
                }}
              >
                {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend email"}
              </Button>
            </FieldDescription>
          </Field>
          <Field>
            <Button
              type="submit"
              disabled={pending || code.length < CODE_LENGTH}
            >
              {pending && <Spinner data-icon="inline-start" />}
              {pending ? "Verifying…" : "Verify"}
            </Button>
            <Button variant="ghost" type="button" onClick={onBack}>
              <ArrowLeft data-icon="inline-start" />
              Use a different email
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
