import { loader } from "@monaco-editor/react"
import * as monaco from "monaco-editor/editor/editor.api"
import EditorWorker from "monaco-editor/editor/editor.worker?worker"
import "monaco-editor/features/register.all"
import {
  conf as cppConf,
  language as cppLanguage,
} from "monaco-editor/languages/definitions/cpp/cpp"
import "monaco-editor/languages/definitions/java/register"
import "monaco-editor/languages/definitions/python/register"

// Monaco is bundled rather than fetched from a CDN, which school networks
// can block. It takes only the editor and the languages students write, with
// no TypeScript, CSS, HTML or JSON services, so one plain worker covers it.
self.MonacoEnvironment = { getWorker: () => new EditorWorker() }

// Monaco's C++ highlighting marks keywords but not types or calls. This adds
// both, so code reads as it does in an IDE: the standard containers are
// types, and a name followed by "(" is a function.
const STANDARD_TYPES = [
  "array",
  "deque",
  "list",
  "map",
  "multimap",
  "multiset",
  "pair",
  "priority_queue",
  "queue",
  "set",
  "stack",
  "string",
  "tuple",
  "unordered_map",
  "unordered_set",
  "vector",
]
const IDENTIFIER = /[a-zA-Z_]\w*/

monaco.languages.register({
  id: "cpp",
  extensions: [".cpp", ".cc", ".cxx", ".hpp", ".hh", ".hxx"],
  aliases: ["C++", "Cpp", "cpp"],
})
monaco.languages.setLanguageConfiguration("cpp", cppConf)
monaco.languages.setMonarchTokensProvider("cpp", {
  ...cppLanguage,
  standardTypes: STANDARD_TYPES,
  tokenizer: {
    ...cppLanguage.tokenizer,
    // Replaces Monaco's identifier rule. Should that rule ever change shape,
    // this leaves its tokenizer as it is.
    root: cppLanguage.tokenizer.root.flatMap((rule) =>
      Array.isArray(rule) && String(rule[0]) === String(IDENTIFIER)
        ? [
            [
              /[a-zA-Z_]\w*(?=\s*\()/,
              {
                cases: {
                  "@keywords": "keyword.$0",
                  "@default": "function",
                },
              },
            ],
            [
              IDENTIFIER,
              {
                cases: {
                  "@keywords": "keyword.$0",
                  "@standardTypes": "type",
                  "@default": "identifier",
                },
              },
            ],
          ]
        : [rule]
    ),
  },
})

// Monaco has no formatter for these languages, so Format code re-indents
// by braces: each line sits one level in from the braces still open above
// it. Python is left alone, since its indentation is its structure.
monaco.languages.registerDocumentFormattingEditProvider(["cpp", "java"], {
  provideDocumentFormattingEdits(model, options) {
    const unit = options.insertSpaces ? " ".repeat(options.tabSize) : "\t"
    let depth = 0
    const lines = model.getLinesContent().map((line) => {
      const code = line.trim()
      // Braces in strings, characters and comments don't count.
      const braces = code.replace(
        /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/.*$/g,
        ""
      )
      const opens = braces.split("{").length - 1
      const closes = braces.split("}").length - 1
      const leadingCloses = /^}*/.exec(braces)![0].length
      const indent = Math.max(0, depth - leadingCloses)
      depth = Math.max(0, depth + opens - closes)
      return code && unit.repeat(indent) + code
    })
    return [
      { range: model.getFullModelRange(), text: lines.join(model.getEOL()) },
    ]
  },
})

// The background is transparent, so the editor takes the pane's own.
const transparent = "#00000000"

monaco.editor.defineTheme("classroom-light", {
  base: "vs",
  inherit: true,
  rules: [
    { token: "comment", foreground: "71717a", fontStyle: "italic" },
    { token: "keyword", foreground: "4f46e5" },
    { token: "keyword.true", foreground: "7c3aed" },
    { token: "keyword.false", foreground: "7c3aed" },
    { token: "number", foreground: "7c3aed" },
    { token: "string", foreground: "c2410c" },
    { token: "type", foreground: "0f766e" },
    { token: "function", foreground: "a16207" },
  ],
  colors: {
    "editor.background": transparent,
    "editor.foreground": "#18181b",
    "editor.lineHighlightBackground": transparent,
    "editor.lineHighlightBorder": transparent,
    "editor.selectionBackground": "#e4e4e7",
    "editor.inactiveSelectionBackground": "#f4f4f5",
    "editorCursor.foreground": "#18181b",
    "editorLineNumber.foreground": "#a1a1aa",
    "editorLineNumber.activeForeground": "#3f3f46",
    "editorIndentGuide.background1": "#f4f4f5",
    "editorIndentGuide.activeBackground1": "#e4e4e7",
    "editorWidget.background": "#ffffff",
    "editorWidget.border": "#e4e4e7",
    "scrollbarSlider.background": "#a1a1aa55",
    "scrollbarSlider.hoverBackground": "#a1a1aa88",
    "scrollbarSlider.activeBackground": "#71717a88",
  },
})

monaco.editor.defineTheme("classroom-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "71717a", fontStyle: "italic" },
    { token: "keyword", foreground: "8b9cf7" },
    { token: "keyword.true", foreground: "c4a5ff" },
    { token: "keyword.false", foreground: "c4a5ff" },
    { token: "number", foreground: "c4a5ff" },
    { token: "string", foreground: "f5a97f" },
    { token: "type", foreground: "5eead4" },
    { token: "function", foreground: "f0c674" },
  ],
  colors: {
    "editor.background": transparent,
    "editor.foreground": "#e4e4e7",
    "editor.lineHighlightBackground": transparent,
    "editor.lineHighlightBorder": transparent,
    "editor.selectionBackground": "#3f3f46",
    "editor.inactiveSelectionBackground": "#27272a",
    "editorCursor.foreground": "#fafafa",
    "editorLineNumber.foreground": "#71717a",
    "editorLineNumber.activeForeground": "#d4d4d8",
    "editorIndentGuide.background1": "#27272a",
    "editorIndentGuide.activeBackground1": "#3f3f46",
    "editorWidget.background": "#18181b",
    "editorWidget.border": "#27272a",
    "scrollbarSlider.background": "#52525b80",
    "scrollbarSlider.hoverBackground": "#71717a99",
    "scrollbarSlider.activeBackground": "#a1a1aa99",
  },
})

loader.config({ monaco })

export { Editor } from "@monaco-editor/react"
