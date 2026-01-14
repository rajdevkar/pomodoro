"use client";

import { useGestureControl } from "@/hooks/useGestureControl";
import {
  durationMinutesAtom,
  isActiveAtom,
  stepMinutesAtom,
  toastMessageAtom,
} from "@/store/atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState, useCallback } from "react";
import { useWakeLock } from "react-screen-wake-lock";
import SettingsControl from "./SettingsControl";
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
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0);
  const isInitializedRef = useRef(false);

  // --- Wake Lock ---
  const { isSupported, released, request } = useWakeLock({
    onRequest: () => console.log("Screen Wake Lock: Requested!"),
    onError: () => console.log("Screen Wake Lock: Error!"),
    onRelease: () => console.log("Screen Wake Lock: Released!"),
  });

  // --- Initialization ---
  // Only sync timeLeftMs with durationMinutes ONCE on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      if (typeof window !== "undefined") {
        setTimeLeftMs(durationMinutes * 60 * 1000);
        isInitializedRef.current = true;
      }
    }
  }, [durationMinutes]);

  // --- Core Timer Logic ---
  const adjustTime = useCallback(
    (direction: "increment" | "decrement") => {
      // 1. Calculate new duration
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

      // 2. Update Persisted Settings
      setDurationMinutes(newDuration);

      // 3. Update Current Timer State (Explicitly Pause & Reset)
      setIsActive(false);
      setTimeLeftMs(newDuration * 60 * 1000);
    },
    [durationMinutes, stepMinutes, setDurationMinutes, setIsActive, setToastMessage],
  );

  const toggleTimer = useCallback(() => {
    if (!isActive) {
      // STARTING
      if (isSupported && released) {
        request();
      }
      setIsActive(true);
    } else {
      // PAUSING
      setIsActive(false);
    }
  }, [isActive, setIsActive, isSupported, released, request]);

  // --- Interval Loop ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      lastUpdateTimeRef.current = Date.now();

      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastUpdateTimeRef.current;

        // Update every ~10ms for smoothness, but logic runs at interval speed
        if (elapsed >= 10) {
          setTimeLeftMs((prev) => {
            if (prev <= 0) {
              setIsActive(false);
              return 0;
            }
            const newValue = Math.max(0, prev - elapsed);
            lastUpdateTimeRef.current = now; // Sync time
            return newValue;
          });
        }
      }, 50);
    }

    return () => clearInterval(interval);
  }, [isActive, setIsActive]);

  // --- Gesture & Touch Controls ---
  const { requestPermission, permissionGranted } = useGestureControl({
    onTiltRight: () => adjustTime("increment"),
    onTiltLeft: () => adjustTime("decrement"),
  });

  const handleInteraction = (e: React.MouseEvent) => {
    const width = window.innerWidth;
    const x = e.clientX;
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    if (timeSinceLastClick < 300) {
      // --- DOUBLE CLICK ---
      if (x < width / 2) {
        adjustTime("decrement");
      } else {
        adjustTime("increment");
      }
    } else {
      // --- SINGLE CLICK (Wait for potential double) ---
      clickTimeoutRef.current = setTimeout(() => {
        if (!permissionGranted) {
          requestPermission();
        }
        toggleTimer();
      }, 300);
    }
  };

  return (
    <>
      <TimerDisplay
        timeLeftMs={timeLeftMs}
        handleInteraction={handleInteraction}
      />
      <SettingsControl />
      <Toast />
    </>
  );
}
