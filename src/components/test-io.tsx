import { cn } from "cn"

import { Label } from "@/components/ui/label"

const labelClassName =
  "text-[11px] leading-4 font-semibold tracking-wide text-muted-foreground uppercase"

/** The small caps over a test's input or output. Labels a field when given
    its id. */
export function TestIoLabel({
  htmlFor,
  className,
  children,
}: {
  htmlFor?: string
  className?: string
  children: React.ReactNode
}) {
  return htmlFor ? (
    <Label htmlFor={htmlFor} className={cn(labelClassName, className)}>
      {children}
    </Label>
  ) : (
    <div className={cn(labelClassName, className)}>{children}</div>
  )
}

/** A test's input or output as it reads to the program: monospaced, spacing
    kept. */
export function TestIoBox({
  className,
  ...props
}: React.ComponentProps<"pre">) {
  return (
    <pre
      className={cn(
        "min-h-10 overflow-x-auto rounded-lg border bg-muted/40 px-3 py-2 font-mono text-[13px] leading-6",
        className
      )}
      {...props}
    />
  )
}
