import { PACIFIC_TIME_ZONE } from "../constants"

/**
 * Academic year rollover in Pacific · Aug = start of fall term (advance grade).
 * `eighthGradeFallYear` is the calendar year when 8th grade began for you (August).
 */
export function gradeInPacificGradeLevel(eighthGradeFallYear = 2025): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TIME_ZONE,
    year: "numeric",
    month: "numeric",
  })

  let year = 0
  let month = 0
  for (const p of dtf.formatToParts(new Date())) {
    if (p.type === "year") year = Number(p.value)
    if (p.type === "month") month = Number(p.value)
  }

  /** School year keyed by calendar year whose August starts fall term. */
  const schoolFallYear = month >= 8 ? year : year - 1

  return 8 + (schoolFallYear - eighthGradeFallYear)
}

export function ordinalGrade(n: number): string {
  const j = n % 10
  const k = n % 100
  if (j === 1 && k !== 11) return `${n}st`
  if (j === 2 && k !== 12) return `${n}nd`
  if (j === 3 && k !== 13) return `${n}rd`
  return `${n}th`
}
