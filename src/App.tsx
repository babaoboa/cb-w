import { useState, useTransition } from "react"

import { ErrorState } from "@/components/error-state"
import { HomeScreen } from "@/components/home-screen"
import { LoginForm } from "@/components/login-form"
import { VerifyEmailForm } from "@/components/verify-email-form"
import { Button } from "@/components/ui/button"
import { FieldDescription } from "@/components/ui/field"
import { InvalidCodeError, sendLoginCode, verifyLoginCode } from "@/lib/auth"

export function App() {
  const [step, setStep] = useState<"email" | "verify" | "error" | "home">(
    "email"
  )
  const [email, setEmail] = useState("")
  const [codeError, setCodeError] = useState<string>()
  const [pending, startTransition] = useTransition()

  function sendCode(address: string) {
    startTransition(async () => {
      try {
        await sendLoginCode(address)
        setCodeError(undefined)
        setStep("verify")
      } catch {
        setStep("error")
      }
    })
  }

  function verifyCode(code: string) {
    startTransition(async () => {
      try {
        await verifyLoginCode(email, code)
        setStep("home")
      } catch (error) {
        if (error instanceof InvalidCodeError) {
          setCodeError(error.message)
        } else {
          setStep("error")
        }
      }
    })
  }

  if (step === "home") {
    return <HomeScreen onSignOut={() => setStep("email")} />
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <main className="flex flex-1 items-center justify-center px-6 pb-24">
        {step === "email" && (
          <LoginForm
            defaultEmail={email}
            pending={pending}
            onEmailSubmit={(value) => {
              setEmail(value)
              sendCode(value)
            }}
          />
        )}
        {step === "verify" && (
          <VerifyEmailForm
            email={email}
            error={codeError}
            pending={pending}
            onBack={() => setStep("email")}
            onCodeChange={() => setCodeError(undefined)}
            onResend={() => sendCode(email)}
            onVerify={verifyCode}
          />
        )}
        {step === "error" && <ErrorState onBack={() => setStep("email")} />}
      </main>
      <footer className="p-6">
        <FieldDescription className="mx-auto max-w-sm text-center text-xs text-balance">
          By continuing, you agree to our <a href="#">Terms of Use</a> and{" "}
          <a href="#">Privacy policy</a>
        </FieldDescription>
      </footer>
      {import.meta.env.DEV && (
        <Button
          variant="outline"
          size="sm"
          className="fixed right-4 bottom-4 border-dashed"
          onClick={() => setStep("home")}
        >
          Skip sign-in (dev)
        </Button>
      )}
    </div>
  )
}

export default App
