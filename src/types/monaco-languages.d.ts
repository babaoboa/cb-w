// Monaco ships its language definitions without types.
declare module "monaco-editor/languages/definitions/cpp/cpp" {
  import type { languages } from "monaco-editor/editor/editor.api"

  export const conf: languages.LanguageConfiguration
  export const language: languages.IMonarchLanguage
}
