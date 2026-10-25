import { Check, Copy } from "@keyline-icons/react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/** One of a problem's sample cases: its input beside the output it should
    produce, with a button to copy the input. */
export function ProblemSample({
  number,
  input,
  output,
}: {
  number: number
  input: string
  output: string
}) {
  return (
    <Card size="sm" className="gap-0 py-0">
      <CardHeader className="items-center border-b py-1.5 pr-1.5 [.border-b]:pb-1.5">
        <CardTitle className="text-xs text-muted-foreground">
          Sample {number}
        </CardTitle>
        <CardAction className="self-center">
          <CopyButton text={input} />
        </CardAction>
      </CardHeader>
      <CardContent className="grid grid-cols-2 divide-x px-0">
        <SampleText label="Input" text={input} />
        <SampleText label="Output" text={output} />
      </CardContent>
    </Card>
  )
}

function SampleText({ label, text }: { label: string; text: string }) {
  return (
    <div className="min-w-0 px-3 py-2.5">
      <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <pre className="mt-1 overflow-x-auto font-mono text-[13px] leading-6">
        {text}
      </pre>
    </div>
  )
}

// How long the check mark shows after a copy.
const COPIED_DURATION = 2000

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), COPIED_DURATION)
    return () => clearTimeout(timeout)
  }, [copied])

  const label = copied ? "Copied" : "Copy input"
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            className="text-muted-foreground"
            onClick={() => {
              void navigator.clipboard
                .writeText(text)
                .then(() => setCopied(true))
            }}
          />
        }
      >
        {copied ? <Check /> : <Copy />}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
