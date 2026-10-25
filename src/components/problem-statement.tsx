import type { Root, RootContent } from "mdast"
import Markdown, { type Components } from "react-markdown"
import remarkDirective from "remark-directive"
import remarkGfm from "remark-gfm"
import { visit } from "unist-util-visit"

import { ProblemHint, ProblemHints } from "@/components/problem-hints"
import { ProblemSample } from "@/components/problem-sample"
import { TeacherNote, TeacherNoteHighlight } from "@/components/teacher-note"
import { sampleOf } from "@/lib/problem"

/** Renders a problem's statement from the markdown in its README. Besides
    plain markdown it takes three blocks:

        :::note{from="Ms. Patel" initials="SP"}
        A tip from the teacher.
        :::

        :::sample
        ```input
        ...
        ```
        ```output
        ...
        ```
        :::

        :::hint
        A nudge, locked until the hint before it is opened.
        :::

    Hints gather at the end of the statement, wherever they're written. */
export function ProblemStatement({ markdown }: { markdown: string }) {
  return (
    <div className="space-y-4 text-[15px] leading-7">
      <Markdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkProblemBlocks]}
        components={components}
      >
        {markdown}
      </Markdown>
    </div>
  )
}

type Directive = Extract<RootContent, { type: "containerDirective" }>

const isHint = (node: RootContent): node is Directive =>
  node.type === "containerDirective" && node.name === "hint"

/** Hands each block to the element its component renders from: a note to an
    aside with its text marked, a sample to a figure carrying its input and
    output, and the hints, numbered, to details in one closing section. */
function remarkProblemBlocks() {
  return (tree: Root) => {
    const hints = tree.children.filter(isHint)
    if (hints.length > 0) {
      hints.forEach((hint, index) => {
        hint.data = { hName: "details", hProperties: { number: index + 1 } }
      })
      tree.children = tree.children.filter((node) => !isHint(node))
      tree.children.push({
        type: "containerDirective",
        name: "hints",
        children: hints,
        data: { hName: "section" },
      })
    }

    let samples = 0
    visit(tree, "containerDirective", (node) => {
      if (node.name === "note") {
        const from = node.attributes?.from ?? ""
        node.data = {
          hName: "aside",
          hProperties: {
            from,
            initials: node.attributes?.initials ?? initialsOf(from),
          },
        }
        for (const child of node.children) {
          if (child.type === "paragraph") {
            child.children = [
              {
                type: "emphasis",
                data: { hName: "mark" },
                children: child.children,
              },
            ]
          }
        }
      } else if (node.name === "sample") {
        samples += 1
        node.data = {
          hName: "figure",
          hProperties: { number: samples, ...sampleOf(node) },
        }
        node.children = []
      }
    })
    // Directive syntax claims a colon followed by a word, as in "rooms 1:n",
    // so put back any text that wasn't meant as one.
    visit(tree, "textDirective", (node, index, parent) => {
      parent?.children.splice(index!, 1, {
        type: "text",
        value: `:${node.name}`,
      })
    })
  }
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const headingClassName = "pt-4 text-sm leading-6 font-semibold mb-1"

const components: Components = {
  h2: ({ children }) => <h2 className={headingClassName}>{children}</h2>,
  h3: ({ children }) => <h3 className={headingClassName}>{children}</h3>,
  a: ({ href, children }) => (
    <a href={href} className="text-primary underline underline-offset-4">
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 pl-5 marker:text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-5 marker:text-muted-foreground">
      {children}
    </ol>
  ),
  code: ({ children }) => (
    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">
      {children}
    </code>
  ),
  // Code blocks outside a sample. Their code drops the inline chip.
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-xl bg-muted p-3 font-mono text-[13px] leading-6 [&>code]:bg-transparent [&>code]:p-0">
      {children}
    </pre>
  ),
  aside: ({ node, children }) => (
    <TeacherNote
      from={String(node?.properties.from)}
      initials={String(node?.properties.initials)}
    >
      {children}
    </TeacherNote>
  ),
  mark: ({ children }) => (
    <TeacherNoteHighlight>{children}</TeacherNoteHighlight>
  ),
  figure: ({ node }) => (
    <ProblemSample
      number={Number(node?.properties.number)}
      input={String(node?.properties.input)}
      output={String(node?.properties.output)}
    />
  ),
  section: ({ children }) => (
    <div className="pt-4">
      <ProblemHints>{children}</ProblemHints>
    </div>
  ),
  details: ({ node, children }) => (
    <ProblemHint number={Number(node?.properties.number)}>
      {children}
    </ProblemHint>
  ),
}
