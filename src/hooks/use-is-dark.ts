import { useSyncExternalStore } from "react"

// The theme provider sets the resolved theme as a class on <html>.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
  return () => observer.disconnect()
}

/** Whether the page is showing its dark theme, whatever chose it. */
export function useIsDark() {
  return useSyncExternalStore(subscribe, () =>
    document.documentElement.classList.contains("dark")
  )
}
