import type { RootContent } from "mdast"
import remarkDirective from "remark-directive"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { visit } from "unist-util-visit"
import { parse } from "yaml"

export type Difficulty = "Easy" | "Medium" | "Hard"

export interface Sample {
  input: string
  output: string
}

/** A problem as its README describes it. */
export interface Problem {
  /** The name of the problem's folder, like "hallway-shortcuts". */
  id: string
  number: number
  title: string
  difficulty: Difficulty
  topics: string[]
  /** The time limit, as shown, like "1 s". */
  time: string
  /** The memory limit, as shown, like "256 MB". */
  memory: string
  due?: Date
  /** The markdown below the frontmatter. */
  statement: string
  /** The statement's `:::sample` blocks, in order. */
  samples: Sample[]
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/

/** Reads a problem's README: its details in YAML frontmatter, then the
    statement in markdown. */
export function parseProblem(id: string, readme: string): Problem {
  const match = FRONTMATTER.exec(readme)
  if (!match) {
    throw new Error("A problem's README must start with --- frontmatter.")
  }
  // The YAML core schema leaves dates as strings.
  const { due, ...details } = parse(match[1]) as Omit<
    Problem,
    "id" | "due" | "statement" | "samples"
  > & { due?: string }
  const statement = readme.slice(match[0].length)
  return {
    ...details,
    id,
    due: due ? new Date(due) : undefined,
    statement,
    samples: samplesIn(statement),
  }
}

function samplesIn(statement: string) {
  const tree = unified().use(remarkParse).use(remarkDirective).parse(statement)
  const samples: Sample[] = []
  visit(tree, "containerDirective", (node) => {
    if (node.name === "sample") samples.push(sampleOf(node))
  })
  return samples
}

type Directive = Extract<RootContent, { type: "containerDirective" }>

/** A `:::sample` block's input and output. Its code blocks can be tagged
    input and output; untagged, they go in that order. */
export function sampleOf(directive: Directive): Sample {
  const blocks = directive.children.filter((child) => child.type === "code")
  const block = (lang: string, index: number) =>
    (blocks.find((b) => b.lang === lang) ?? blocks.at(index))?.value ?? ""
  return { input: block("input", 0), output: block("output", 1) }
}
