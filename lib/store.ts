import { create } from "zustand";

export type SectionId = "hero" | "about" | "work" | "contact";

interface ScrollState {
  progress: number;
  activeSection: SectionId;
  reducedMotion: boolean;
  setProgress: (progress: number) => void;
  setActiveSection: (section: SectionId) => void;
  setReducedMotion: (reduced: boolean) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  activeSection: "hero",
  reducedMotion: false,
  setProgress: (progress) => set({ progress }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));
