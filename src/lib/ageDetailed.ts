/** Mean Gregorian year seconds from `365 + 97/400`. */
export const SECONDS_PER_GREGORIAN_YEAR = (365 + 97 / 400) * 86400

export function birthDateFromIso(isoLocalDate: string): Date {
  const parts = isoLocalDate.split("-")
  if (parts.length !== 3) {
    throw new RangeError(`Invalid ISO date string: ${isoLocalDate}`)
  }

  const [y, m, d] = parts.map(Number)
  if (![y, m, d].every((n) => Number.isFinite(n))) {
    throw new RangeError(`Invalid ISO date string: ${isoLocalDate}`)
  }

  return new Date(y, m - 1, d)
}

/**
 * Fractional Gregorian years elapsed from `from` to `to`.
 * Stable enough for UI; swaps sign if dates are inverted.
 */
export function getElapsedGregorianYears(from: Date, to: Date): number {
  const deltaSec = (to.getTime() - from.getTime()) / 1000
  const sign = deltaSec < 0 ? -1 : 1
  return sign * Math.abs(deltaSec / SECONDS_PER_GREGORIAN_YEAR)
}
