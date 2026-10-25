import { Lock } from "@keyline-icons/react"
import { createContext, use, useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// The highest-numbered hint opened so far.
const RevealedContext = createContext(0)

/** A problem's hints, each locked until the one before it has been opened.
    Closing a hint again leaves the next one unlocked. */
export function ProblemHints({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(0)

  return (
    <RevealedContext value={revealed}>
      <Accordion
        multiple
        className="border-y"
        onValueChange={(open) =>
          setRevealed((current) => Math.max(current, ...open.map(Number)))
        }
      >
        {children}
      </Accordion>
    </RevealedContext>
  )
}

export function ProblemHint({
  number,
  children,
}: {
  number: number
  children: React.ReactNode
}) {
  const revealed = use(RevealedContext)
  const locked = number > revealed + 1

  return (
    <AccordionItem value={number} disabled={locked}>
      <AccordionTrigger className="py-3 font-semibold">
        {locked && <Lock className="text-muted-foreground" />}
        Hint {number}
        {locked && (
          <span className="ml-auto text-xs font-medium text-muted-foreground">
            Open hint {number - 1} first
          </span>
        )}
      </AccordionTrigger>
      {/* Indented to line up with the label, past the chevron. */}
      <AccordionContent className="pb-4 pl-6 text-[15px] leading-7">
        {children}
      </AccordionContent>
    </AccordionItem>
  )
}
