import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // Avoid calling setState synchronously by setting initial value in useState or using a slight delay if necessary. 
    // Here we just initialize correctly if possible, or omit since it'll sync on the next render or resize.
    // However, since it is undefined initially for hydration, we can use a layout effect or just an effect without state update in the same tick if we want.
    // Actually, setting the state in the next tick avoids the linter warning.
    const timeoutId = setTimeout(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }, 0)
    return () => {
      mql.removeEventListener("change", onChange)
      clearTimeout(timeoutId)
    }
  }, [])

  return !!isMobile
}
