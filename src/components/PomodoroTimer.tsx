"use client";

import {
  durationMinutesAtom,
  isActiveAtom,
  remainingTimeAtom,
  stepMinutesAtom,
  targetEndTimeAtom,
  themeAtom,
  toastMessageAtom,
} from "@/store/atoms";
import { playNotificationSound } from "@/utils/audioUtils";
import { formatTime } from "@/utils/timeUtils";
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
  const [targetEndTime, setTargetEndTime] = useAtom(targetEndTimeAtom);
  const [remainingTime, setRemainingTime] = useAtom(remainingTimeAtom);

  // Local state for smooth display updates (synced with persisted state)
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

  // Re-request wake lock if released while active (e.g. switching tabs)
  useEffect(() => {
    if (isActive && isSupported && released) {
      request();
    }
  }, [isActive, isSupported, released, request]);

  // --- Initialization & Sync ---
  useEffect(() => {
    // If active, calculate remaining time based on target
    if (isActive && targetEndTime) {
      const remaining = Math.max(0, targetEndTime - Date.now());
      setTimeLeftMs(remaining);
      if (remaining <= 0) {
        handleTimerComplete();
      }
    } else if (remainingTime !== null) {
      // If paused with stored remaining time
      setTimeLeftMs(remainingTime);
    } else {
      // creating a new timer or reset state
      setTimeLeftMs(durationMinutes * 60 * 1000);
    }

    // Request notification permission on mount
    if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Sync timeLeftMs when duration changes (only if not active/paused in middle)
  useEffect(() => {
    if (!isActive && remainingTime === null) {
      setTimeLeftMs(durationMinutes * 60 * 1000);
    }
  }, [durationMinutes, isActive, remainingTime]);

  // Update title
  useEffect(() => {
    document.title = `${formatTime(timeLeftMs)} - Timo`;
  }, [timeLeftMs]);

  const handleTimerComplete = () => {
    setIsActive(false);
    setTargetEndTime(null);
    setRemainingTime(null);
    setTimeLeftMs(durationMinutes * 60 * 1000);

    // Show notification
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification("Timo", {
          body: "Timer finished!",
          icon: "/logo.png"
        });
      } catch (e) {
        console.error("Notification error", e);
      }
    }

    // Play melody
    playNotificationSound();
  };

  // --- Core Timer Logic ---
  const adjustTime = (direction: "increment" | "decrement") => {
    if (isActive) return;

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
    // Reset any paused state when adjusting time
    setRemainingTime(null);
    setTargetEndTime(null);
    setTimeLeftMs(newDuration * 60 * 1000);
  };

  const toggleTimer = () => {
    if (!isActive) {
      // Start
      if (isSupported && released) {
        request();
      }

      const duration = remainingTime !== null ? remainingTime : durationMinutes * 60 * 1000;
      const target = Date.now() + duration;

      setTargetEndTime(target);
      setRemainingTime(null); // Clear paused state
      setIsActive(true);
    } else {
      // Pause
      if (targetEndTime) {
        const remaining = Math.max(0, targetEndTime - Date.now());
        setRemainingTime(remaining);
      }
      setTargetEndTime(null);
      setIsActive(false);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTargetEndTime(null);
    setRemainingTime(null);
    setTimeLeftMs(durationMinutes * 60 * 1000);
  };

  // --- Settings Logic ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Interval Loop ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && targetEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = targetEndTime - now;

        if (diff <= 0) {
          handleTimerComplete();
        } else {
          setTimeLeftMs(diff);
        }
      }, 50);
    }

    return () => clearInterval(interval);
  }, [isActive, targetEndTime, durationMinutes]);

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
