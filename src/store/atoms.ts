import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// Persisted atoms
export const themeAtom = atomWithStorage<"light" | "dark">(
  "pomodoro-theme",
  "dark",
);

export const fontIndexAtom = atomWithStorage<number>("pomodoro-font-index", 0);

export const fontSizePercentAtom = atomWithStorage<number>(
  "pomodoro-font-size-percent",
  50,
);

export const stepMinutesAtom = atomWithStorage<number>(
  "pomodoro-step-minutes",
  5,
);

// Non-persisted atoms
// export const durationMinutesAtom = atom<number>(25); // Moved to persisted
export const durationMinutesAtom = atomWithStorage<number>(
  "pomodoro-duration-minutes",
  25,
);

// Stores the timestamp (ms) when the timer is expected to end
export const targetEndTimeAtom = atomWithStorage<number | null>(
  "pomodoro-target-end-time",
  null,
);

// Stores the remaining duration (ms) when the timer is paused
export const remainingTimeAtom = atomWithStorage<number | null>(
  "pomodoro-remaining-time",
  null,
);

export const isActiveAtom = atomWithStorage<boolean>("pomodoro-is-active", false);

export const toastMessageAtom = atom<string | null>(null);
