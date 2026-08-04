import AsyncStorage from "@react-native-async-storage/async-storage";
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

const storage = createJSONStorage<any>(() => AsyncStorage);

// Persisted atoms
export const themeAtom = atomWithStorage<"light" | "dark">(
  "pomodoro-theme",
  "dark",
  storage,
);

export const fontIndexAtom = atomWithStorage<number>(
  "pomodoro-font-index",
  0,
  storage,
);

export const fontSizePercentAtom = atomWithStorage<number>(
  "pomodoro-font-size-percent",
  50,
  storage,
);

export const stepMinutesAtom = atomWithStorage<number>(
  "pomodoro-step-minutes",
  5,
  storage,
);

export const durationMinutesAtom = atomWithStorage<number>(
  "pomodoro-duration-minutes",
  25,
  storage,
);

// Stores the timestamp (ms) when the timer is expected to end
export const targetEndTimeAtom = atomWithStorage<number | null>(
  "pomodoro-target-end-time",
  null,
  storage,
);

// Stores the remaining duration (ms) when the timer is paused
export const remainingTimeAtom = atomWithStorage<number | null>(
  "pomodoro-remaining-time",
  null,
  storage,
);

export const isActiveAtom = atomWithStorage<boolean>(
  "pomodoro-is-active",
  false,
  storage,
);

export const toastMessageAtom = atom<string | null>(null);
