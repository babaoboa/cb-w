import { Bin, Plus, RotateCcw } from "@keyline-icons/react"
import { cn } from "cn"
import { useId, useRef, useState } from "react"

import { PaneTabsList, PaneTabsTrigger } from "@/components/pane-tabs"
import { TestIoBox, TestIoLabel } from "@/components/test-io"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Sample } from "@/lib/problem"

interface CustomTest {
  id: number
  input: string
  expected: string
}

const subTabClassName = "text-xs group-data-horizontal/tabs:h-7"

/** The tests a student can run before submitting: the problem's samples,
    which they can edit, and tests of their own. */
export function TestCases({ samples }: { samples: Sample[] }) {
  // Edited sample inputs, by sample index.
  const [edits, setEdits] = useState<Record<number, string>>({})
  const [custom, setCustom] = useState<CustomTest[]>([])
  const [selected, setSelected] = useState("sample-0")
  const nextId = useRef(1)

  function addTest() {
    const id = nextId.current++
    setCustom((tests) => [...tests, { id, input: "", expected: "" }])
    setSelected(`custom-${id}`)
  }

  function updateTest(id: number, change: Partial<CustomTest>) {
    setCustom((tests) =>
      tests.map((test) => (test.id === id ? { ...test, ...change } : test))
    )
  }

  function removeTest(id: number) {
    const index = custom.findIndex((test) => test.id === id)
    const rest = custom.filter((test) => test.id !== id)
    setCustom(rest)
    // Lands on the test before, or the last sample when it was the first.
    const before = rest[index - 1]
    setSelected(before ? `custom-${before.id}` : `sample-${samples.length - 1}`)
  }

  return (
    <Tabs
      value={selected}
      onValueChange={(value) => setSelected(String(value))}
      className="gap-3"
    >
      <div className="flex flex-wrap items-center gap-1">
        <PaneTabsList className="flex-wrap group-data-horizontal/tabs:h-auto">
          {samples.map((_, index) => (
            <PaneTabsTrigger
              key={index}
              value={`sample-${index}`}
              className={subTabClassName}
            >
              Sample {index + 1}
            </PaneTabsTrigger>
          ))}
          {custom.map((test, index) => (
            <PaneTabsTrigger
              key={test.id}
              value={`custom-${test.id}`}
              className={subTabClassName}
            >
              Custom {index + 1}
            </PaneTabsTrigger>
          ))}
        </PaneTabsList>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Add a test"
                className="text-muted-foreground"
                onClick={addTest}
              />
            }
          >
            <Plus />
          </TooltipTrigger>
          <TooltipContent>Add a test</TooltipContent>
        </Tooltip>
      </div>
      {samples.map((sample, index) => (
        <TabsContent key={index} value={`sample-${index}`} keepMounted>
          <SampleTest
            sample={sample}
            input={edits[index] ?? sample.input}
            onInputChange={(input) =>
              setEdits((current) => ({ ...current, [index]: input }))
            }
            onReset={() =>
              setEdits((current) => {
                const rest = { ...current }
                delete rest[index]
                return rest
              })
            }
          />
        </TabsContent>
      ))}
      {custom.map((test) => (
        <TabsContent key={test.id} value={`custom-${test.id}`} keepMounted>
          <OwnTest
            test={test}
            onChange={(change) => updateTest(test.id, change)}
            onRemove={() => removeTest(test.id)}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function SampleTest({
  sample,
  input,
  onInputChange,
  onReset,
}: {
  sample: Sample
  input: string
  onInputChange: (input: string) => void
  onReset: () => void
}) {
  const id = useId()
  const edited = input !== sample.input
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex h-6 items-center justify-between">
          <TestIoLabel htmlFor={id}>Input</TestIoLabel>
          {edited && (
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={onReset}
            >
              <RotateCcw data-icon="inline-start" />
              Reset
            </Button>
          )}
        </div>
        <TestInput id={id} value={input} onChange={onInputChange} />
      </div>
      <div className="space-y-1.5">
        <TestIoLabel>
          Expected output
          {/* Only the sample's own input has a known answer. */}
          {edited && (
            <span className="font-normal tracking-normal normal-case">
              {" "}
              · for the original input
            </span>
          )}
        </TestIoLabel>
        <TestIoBox className={edited ? "text-muted-foreground" : undefined}>
          {sample.output}
        </TestIoBox>
      </div>
    </div>
  )
}

function OwnTest({
  test,
  onChange,
  onRemove,
}: {
  test: CustomTest
  onChange: (change: Partial<CustomTest>) => void
  onRemove: () => void
}) {
  const inputId = useId()
  const expectedId = useId()
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex h-6 items-center">
          <TestIoLabel htmlFor={inputId}>Input</TestIoLabel>
        </div>
        <TestInput
          id={inputId}
          value={test.input}
          placeholder="Type or paste the input"
          onChange={(input) => onChange({ input })}
        />
      </div>
      <div className="space-y-1.5">
        <TestIoLabel htmlFor={expectedId}>Expected output</TestIoLabel>
        <TestInput
          id={expectedId}
          value={test.expected}
          placeholder="Optional. Leave it blank to just see what your code prints."
          className="min-h-10"
          onChange={(expected) => onChange({ expected })}
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={onRemove}
      >
        <Bin data-icon="inline-start" />
        Remove test
      </Button>
    </div>
  )
}

function TestInput({
  id,
  value,
  placeholder,
  className,
  onChange,
}: {
  id: string
  value: string
  placeholder?: string
  className?: string
  onChange: (value: string) => void
}) {
  return (
    <Textarea
      id={id}
      value={value}
      placeholder={placeholder}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      className={cn(
        "min-h-24 resize-y bg-muted/40 px-3 py-2 font-mono text-[13px] leading-6 placeholder:font-sans md:text-[13px] dark:bg-muted/40",
        className
      )}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
