export const DISPLAY_NAME = "Dustin Du"

/** Gregorian local date · used for fractional age calculation. */
export const BIRTH_DATE_ISO = "2012-01-26"

export const BIRTH_DATE_LABEL = "January 26, 2012"

export const STACK_LINE = "Vite / React / TypeScript / Tailwind"

export const SITE_TITLE = `${DISPLAY_NAME} · index`

/** GitHub login for API + profile links (public repos). */
export const GITHUB_USERNAME = "Perservatives"

export const LINK_GITHUB_HREF = `https://github.com/${GITHUB_USERNAME}` as const

export const LINK_INSTAGRAM_HREF =
  "https://www.instagram.com/erjelrkjerl/" as const satisfies string

export const EMAIL_RAW = "erjelrkjerl@gmail.com" as const

export const EMAIL_HREF = `mailto:${EMAIL_RAW}` as const

/** IANA zone for clocks + school-grade rollover on this site. */
export const PACIFIC_TIME_ZONE = "America/Los_Angeles"

/**
 * Calendar year whose August PT began your eighth-grade year · used to extrapolate grade.
 * Bump one when you actually move up over the summer.
 */
export const EIGHTH_GRADE_FALL_YEAR_PT = 2025

export const DISCORD_HANDLE = "bergentruck." as const

export const INSTAGRAM_HANDLE = "@erjelrkjerl"

export const LEETCODE_HANDLE = "erjelrkjerl"
export const LINK_LEETCODE_HREF =
  "https://leetcode.com/u/erjelrkjerl/" as const satisfies string

/** Deployed stereo app (Vercel). */
export const LINK_STEREO_LIVE_HREF = "https://stereooffline.vercel.app/" as const satisfies string

export type ProjectCard = Readonly<{
  slug: string
  name: string
  href: string
  blurb: string
  /** Optional public deployment */
  demoHref?: string
}>

/** Highlighted projects (subset of your work). */
export const PROJECT_REPOS: ReadonlyArray<ProjectCard> = [
  {
    slug: "ST-001",
    name: "stereo",
    href: `${LINK_GITHUB_HREF}/stereo`,
    demoHref: LINK_STEREO_LIVE_HREF,
    blurb: "Music player UI — live on Vercel, source on GitHub.",
  },
  {
    slug: "HK-002",
    name: "hackaton-shi",
    href: `${LINK_GITHUB_HREF}/hackaton-shi`,
    blurb: "TypeScript · hackathon team repo.",
  },
]

/**
 * Optional inventory rows surfaced under “Facts” · both strings must be non-empty.
 */
export const EXTRA_ROWS: ReadonlyArray<{ label: string; value: string }> = []
