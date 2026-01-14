"use client";

import {
  durationMinutesAtom,
  isActiveAtom,
  stepMinutesAtom,
  themeAtom,
  toastMessageAtom,
} from "@/store/atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { useWakeLock } from "react-screen-wake-lock";
import BottomControls from "./BottomControls";
import TimerDisplay from "./TimerDisplay";
import Toast from "./Toast";

export default function PomodoroTimer() {
  // --- State & Settings ---
  const stepMinutes = useAtomValue(stepMinutesAtom);
  const [durationMinutes, setDurationMinutes] = useAtom(durationMinutesAtom);
  const [isActive, setIsActive] = useAtom(isActiveAtom);
  const [timeLeftMs, setTimeLeftMs] = useState(durationMinutes * 60 * 1000);
  const setToastMessage = useSetAtom(toastMessageAtom);

  // --- Refs ---
  const lastUpdateTimeRef = useRef<number>(0);


  // --- Wake Lock ---
  const { isSupported, released, request } = useWakeLock({
    onRequest: () => console.log("Screen Wake Lock: Requested!"),
    onError: () => console.log("Screen Wake Lock: Error!"),
    onRelease: () => console.log("Screen Wake Lock: Released!"),
  });

  // --- Initialization ---
  // Sync timeLeftMs with durationMinutes whenever it changes (hydration or settings update)
  useEffect(() => {
    setTimeLeftMs(durationMinutes * 60 * 1000);
  }, [durationMinutes]);

  // --- Core Timer Logic ---
  const adjustTime = (direction: "increment" | "decrement") => {
    let newDuration = durationMinutes;

    if (direction === "increment") {
      if (durationMinutes + stepMinutes > 60) {
        setToastMessage("Maximum duration is 60 minutes");
        return;
      }
      newDuration = Math.min(60, durationMinutes + stepMinutes);
    } else {
      if (durationMinutes - stepMinutes < stepMinutes) {
        setToastMessage(`Minimum duration is ${stepMinutes} minutes`);
        return;
      }
      newDuration = Math.max(stepMinutes, durationMinutes - stepMinutes);
    }

    setDurationMinutes(newDuration);
    setIsActive(false);
    setTimeLeftMs(newDuration * 60 * 1000);
  };

  const toggleTimer = () => {
    if (!isActive) {
      if (isSupported && released) {
        request();
      }
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeftMs(durationMinutes * 60 * 1000);
  };

  // --- Settings Logic ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Interval Loop ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      lastUpdateTimeRef.current = Date.now();

      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastUpdateTimeRef.current;

        if (elapsed >= 10) {
          setTimeLeftMs((prev) => {
            if (prev <= 0) {
              setIsActive(false);
              return 0;
            }
            const newValue = Math.max(0, prev - elapsed);
            lastUpdateTimeRef.current = now;
            return newValue;
          });
        }
      }, 50);
    }

    return () => clearInterval(interval);
  }, [isActive, setIsActive]);

  const theme = useAtomValue(themeAtom);

  return (
    <>
      {/* Portfolio Link */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 pointer-events-none"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <a
          href="https://rajdevkar.dev"
          target="_blank"
          rel="noopener noreferrer"
          className={`px-4 py-2 rounded-full backdrop-blur-sm text-xs font-medium transition-all shadow-sm hover:scale-105 active:scale-95 pointer-events-auto ${theme === "dark"
            ? "bg-white/10 hover:bg-white/20 text-white/50 hover:text-white"
            : "bg-black/5 hover:bg-black/10 text-black/50 hover:text-black"
            }`}
        >
          rajdevkar.dev
        </a>
      </div>

      <TimerDisplay
        timeLeftMs={timeLeftMs}
      />

      <BottomControls
        isActive={isActive}
        onToggle={toggleTimer}
        onReset={resetTimer}
        onIncrement={() => adjustTime("increment")}
        onDecrement={() => adjustTime("decrement")}
        onSettingsToggle={() => setIsSettingsOpen(!isSettingsOpen)}
        isSettingsOpen={isSettingsOpen}
      />

      <Toast />
    </>
  );
}
