// Switches for course pages that are built in later phases. While a switch is off, the course
// home shows the feature as "coming soon" instead of linking to a page that does not exist yet.
// Each phase turns on its own switch when its pages ship.
export const FEATURES = {
  lessonPlayer: false, // Phase 3b
  practiceRoom: false, // Phase 4
  journal: false, // Phase 5
  advancedRoom: false, // Phase 6
} as const
