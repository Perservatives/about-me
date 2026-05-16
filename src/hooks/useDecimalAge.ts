import { useEffect, useMemo, useState } from "react"

import { birthDateFromIso, getElapsedGregorianYears } from "../lib/ageDetailed"

/** Decimal age ticks every second using the visitor's clock (local JS `Date`). */
export function useDecimalGregorianAgeYears(isoBirth: string): number {
  const [clockMs, setClockMs] = useState(() => Date.now())

  const birth = useMemo(() => birthDateFromIso(isoBirth), [isoBirth])

  const years = useMemo(
    () => getElapsedGregorianYears(birth, new Date(clockMs)),
    [birth, clockMs],
  )

  useEffect(() => {
    const id = window.setInterval(() => setClockMs(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return years
}
