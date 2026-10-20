import { TriangleAlert } from "@keyline-icons/react/fill"
import { cn } from "cn"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function ErrorState({
  className,
  onBack,
  ...props
}: React.ComponentProps<"div"> & {
  onBack: () => void
}) {
  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      {...props}
    >
      <Alert variant="warning" className="w-auto">
        <TriangleAlert />
        <AlertTitle className="font-normal">
          We are sorry, an error occurred
        </AlertTitle>
      </Alert>
      <Button
        variant="link"
        className="text-foreground underline"
        onClick={onBack}
        autoFocus
      >
        Go back to the login form
      </Button>
    </div>
  )
}
