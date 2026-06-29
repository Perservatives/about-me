import type { SectionId } from "./store";

export interface SectionConfig {
  id: SectionId;
  label: string;
}

export const SECTIONS: SectionConfig[] = [
  { id: "hero", label: "Intro" },
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

export const SECTION_HEIGHT_VH = 100;
export const TOTAL_SCROLL_VH = SECTIONS.length * SECTION_HEIGHT_VH;

export const GITHUB_USERNAME = "Perservatives";

/** Optional live demos keyed by repo name. */
export const REPO_DEMO_LINKS: Record<string, string> = {
  stereo: "https://stereooffline.vercel.app/",
};

export const PORTFOLIO = {
  name: "Dustin Du",
  about:
    "I'm in school and I code on the side. Python is the one thing I'm actually okay at; everything else is still a work in progress. If you want to see what I've shipped lately, scroll down — or just email me.",
  email: "erjelrkjerl@gmail.com",
  social: [
    { label: "GitHub", href: `https://github.com/${GITHUB_USERNAME}` },
    { label: "Instagram", href: "https://www.instagram.com/erjelrkjerl/" },
    { label: "LeetCode", href: "https://leetcode.com/u/erjelrkjerl/" },
  ],
};
