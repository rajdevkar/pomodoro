import type { EndSoundId, TickSoundId } from "@/utils/audioUtils";
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

export const durationMsAtom = atomWithStorage<number>(
  "pomodoro-duration-ms",
  25 * 60 * 1000,
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

export const tickingSoundAtom = atomWithStorage<TickSoundId>(
  "pomodoro-ticking-sound",
  "off",
  storage,
);

export const endSoundAtom = atomWithStorage<EndSoundId>(
  "pomodoro-end-sound",
  "melody",
  storage,
);

export const toastMessageAtom = atom<string | null>(null);
