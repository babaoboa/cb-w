import {
  Braces,
  Check,
  ChevronDown,
  CodeXml,
  Maximize2,
  Minimize,
  Undo,
} from "@keyline-icons/react"
import { cn } from "cn"
import type { editor } from "monaco-editor/editor/editor.api"
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsDark } from "@/hooks/use-is-dark"

// Monaco is large, so it loads after the page rather than with it.
const Editor = lazy(() =>
  import("@/lib/monaco").then((module) => ({ default: module.Editor }))
)

const LANGUAGES = [
  {
    id: "cpp",
    label: "C++17",
    canFormat: true,
    starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;

    return 0;
}
`,
  },
  {
    id: "python",
    label: "Python 3",
    canFormat: false,
    starter: `import sys

input = sys.stdin.readline


def main():
    n, m = map(int, input().split())


main()
`,
  },
  {
    id: "java",
    label: "Java 17",
    canFormat: true,
    starter: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(in.readLine());
        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());
    }
}
`,
  },
] as const

type LanguageId = (typeof LANGUAGES)[number]["id"]

interface Draft {
  code: string
  savedAt: Date
}

// Placeholder: the student's saved C++ work, until drafts sync with the
// classroom.
const PLACEHOLDER_DRAFT: Draft = {
  savedAt: new Date(2026, 9, 20, 14, 1),
  code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;

    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }

    vector<int> dist(n + 1, -1);
    vector<bool> seen(n + 1, false);
    queue<int> q;
    dist[1] = 0;
    seen[1] = true;
    q.push(1);

    while (!q.empty()) {
        int room = q.front();
        q.pop();
        for (int next : adj[room]) {
            if (!seen[next]) {
                seen[next] = true;
                dist[next] = dist[room] + 1;
                q.push(next);
            }
        }
    }

    // TODO: print the distances
}
`,
}

// Drafts autosave this long after the last keystroke.
const SAVE_DELAY = 800

const draftKey = (problemId: string, languageId: LanguageId) =>
  `draft:${problemId}:${languageId}`

// Drafts live in this browser until they sync with the classroom. Storage
// can be missing or full, so a failed read is no draft and a failed write
// is reported.
function readDraft(problemId: string, languageId: LanguageId) {
  try {
    const stored = localStorage.getItem(draftKey(problemId, languageId))
    if (stored) {
      const { code, savedAt } = JSON.parse(stored) as {
        code: string
        savedAt: string
      }
      return { code, savedAt: new Date(savedAt) }
    }
  } catch {
    // Fall through to the placeholder.
  }
  return languageId === "cpp" ? PLACEHOLDER_DRAFT : undefined
}

function writeDraft(key: string, code: string) {
  const savedAt = new Date()
  try {
    localStorage.setItem(key, JSON.stringify({ code, savedAt }))
    return savedAt
  } catch {
    return undefined
  }
}

type Save =
  | { status: "unsaved" }
  | { status: "saving"; savedAt?: Date }
  | { status: "saved"; savedAt: Date }
  | { status: "failed" }

const savedFormat = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  fontSize: 13,
  lineHeight: 22,
  tabSize: 4,
  insertSpaces: true,
  detectIndentation: false,
  automaticLayout: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  stickyScroll: { enabled: false },
  padding: { top: 4, bottom: 12 },
  lineNumbersMinChars: 3,
  renderLineHighlight: "none",
  // Indentation reads plainly, without guides. Brackets are left uncoloured
  // per model, in onMount.
  guides: { indentation: false },
  overviewRulerLanes: 0,
  overviewRulerBorder: false,
  hideCursorInOverviewRuler: true,
  scrollbar: { useShadows: false, verticalScrollbarSize: 10 },
  // Lets suggestions and hovers spill out of the pane rather than clip.
  fixedOverflowWidgets: true,
}

/** The student's code for a problem, in Monaco. Drafts autosave per
    language, and the teacher can see them. */
export function CodeEditor({
  problemId,
  teacher,
}: {
  problemId: string
  teacher: string
}) {
  const isDark = useIsDark()
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null)
  const [languageId, setLanguageId] = useState<LanguageId>("cpp")
  const language = LANGUAGES.find(({ id }) => id === languageId)!
  const [save, setSave] = useState<Save>(() => savedState(problemId, "cpp"))
  const [cursor, setCursor] = useState({ lineNumber: 1, column: 1 })
  const [tabSize, setTabSize] = useState(4)
  const [canUndo, setCanUndo] = useState(false)
  const [expanded, setExpanded] = useState(false)
  // Monaco reads this only when it first opens a language.
  const initialCode = useMemo(
    () => readDraft(problemId, languageId)?.code ?? language.starter,
    [problemId, languageId, language.starter]
  )

  // The latest unsaved code, written when the typing pauses, the language
  // changes or the page goes away.
  const pending = useRef<{ key: string; code: string }>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const flush = useCallback(() => {
    clearTimeout(saveTimer.current)
    const draft = pending.current
    if (!draft) return
    pending.current = null
    const savedAt = writeDraft(draft.key, draft.code)
    setSave(savedAt ? { status: "saved", savedAt } : { status: "failed" })
  }, [])

  useEffect(() => {
    window.addEventListener("pagehide", flush)
    return () => {
      window.removeEventListener("pagehide", flush)
      flush()
    }
  }, [flush])

  function onChange(code = "") {
    pending.current = { key: draftKey(problemId, languageId), code }
    setSave((current) => ({
      status: "saving",
      savedAt: "savedAt" in current ? current.savedAt : undefined,
    }))
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(flush, SAVE_DELAY)
  }

  function changeLanguage(next: LanguageId) {
    flush()
    setLanguageId(next)
    setSave(savedState(problemId, next))
  }

  function onMount(instance: editor.IStandaloneCodeEditor) {
    editorRef.current = instance
    // Each language keeps its own model, and with it its own undo history.
    const sync = () => {
      const model = instance.getModel()
      // A model's bracket colours are its own option, so the editor's can't
      // turn them off.
      model?.updateOptions({
        bracketColorizationOptions: {
          enabled: false,
          independentColorPoolPerBracketType: false,
        },
      })
      setCursor(instance.getPosition() ?? { lineNumber: 1, column: 1 })
      setTabSize(model?.getOptions().tabSize ?? 4)
      setCanUndo(model?.canUndo() ?? false)
    }
    sync()
    instance.onDidChangeModel(sync)
    instance.onDidChangeCursorPosition(({ position }) => setCursor(position))
    instance.onDidChangeModelContent(() =>
      setCanUndo(instance.getModel()?.canUndo() ?? false)
    )
  }

  function run(action: (instance: editor.IStandaloneCodeEditor) => void) {
    const instance = editorRef.current
    if (!instance) return
    action(instance)
    instance.focus()
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-background",
        expanded && "fixed inset-0 z-40"
      )}
      // Monaco keeps Escape when it has a widget to close.
      onKeyDown={(event) => {
        if (event.key === "Escape" && expanded) setExpanded(false)
      }}
    >
      <div className="@container flex items-center gap-1 p-2">
        <div className="inline-flex h-8 items-center gap-1.5 rounded-md bg-muted px-2 text-sm font-medium">
          <CodeXml className="size-4" />
          Code
        </div>
        <Separator
          orientation="vertical"
          className="mx-1 data-vertical:h-4 data-vertical:self-center"
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="px-2" />}
          >
            {language.label}
            <ChevronDown
              data-icon="inline-end"
              className="text-muted-foreground"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-36">
            <DropdownMenuRadioGroup
              value={languageId}
              onValueChange={(value) => changeLanguage(value as LanguageId)}
            >
              {LANGUAGES.map(({ id, label }) => (
                <DropdownMenuRadioItem key={id} value={id} closeOnClick>
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <SaveStatus save={save} />
        <div className="ml-auto flex items-center gap-1">
          {/* On a narrow pane only the dot shows, with the words kept for
              screen readers. */}
          <Badge
            variant="secondary"
            className="mr-1"
            title={`${teacher} can see this`}
          >
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span className="sr-only @xl:not-sr-only">
              {teacher} can see this
            </span>
          </Badge>
          <ToolbarButton
            label={
              language.canFormat
                ? "Format code"
                : `Formatting isn't available for ${language.label}`
            }
            disabled={!language.canFormat}
            onClick={() =>
              run((instance) => {
                void instance.getAction("editor.action.formatDocument")?.run()
              })
            }
          >
            <Braces />
          </ToolbarButton>
          <ToolbarButton
            label="Undo"
            disabled={!canUndo}
            onClick={() =>
              run((instance) => instance.trigger("toolbar", "undo", null))
            }
          >
            <Undo />
          </ToolbarButton>
          <ToolbarButton
            label={expanded ? "Exit full screen" : "Full screen"}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <Minimize /> : <Maximize2 />}
          </ToolbarButton>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <Suspense fallback={<EditorLoading />}>
          <Editor
            path={draftKey(problemId, languageId)}
            language={languageId}
            defaultValue={initialCode}
            theme={isDark ? "classroom-dark" : "classroom-light"}
            options={EDITOR_OPTIONS}
            loading={<EditorLoading />}
            onMount={onMount}
            onChange={onChange}
          />
        </Suspense>
      </div>
      <div className="flex h-8 shrink-0 items-center gap-4 border-t px-3 text-xs text-muted-foreground tabular-nums">
        <span>
          Ln {cursor.lineNumber}, Col {cursor.column}
        </span>
        <span>Spaces: {tabSize}</span>
        {"savedAt" in save && save.savedAt && (
          <span className="ml-auto">
            Autosaved {savedFormat.format(save.savedAt)}
          </span>
        )}
      </div>
    </div>
  )
}

function savedState(problemId: string, languageId: LanguageId): Save {
  const draft = readDraft(problemId, languageId)
  return draft
    ? { status: "saved", savedAt: draft.savedAt }
    : { status: "unsaved" }
}

function SaveStatus({ save }: { save: Save }) {
  if (save.status === "unsaved") return null
  return (
    <span
      className={cn(
        "flex items-center gap-1 px-1 text-xs font-medium text-muted-foreground",
        save.status === "failed" && "text-destructive"
      )}
    >
      {save.status === "saved" && (
        <Check className="size-3.5 text-emerald-500" />
      )}
      {save.status === "saving" && "Saving…"}
      {save.status === "saved" && "Saved"}
      {save.status === "failed" && "Not saved"}
    </span>
  )
}

function ToolbarButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      {/* A disabled button gets no pointer events, so its wrapper shows the
          tooltip saying why. */}
      <TooltipTrigger render={<span className="inline-flex" />}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          disabled={disabled}
          className="text-muted-foreground"
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function EditorLoading() {
  return (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      <Spinner />
    </div>
  )
}
