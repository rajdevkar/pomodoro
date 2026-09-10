import BottomControls from "@/components/BottomControls";
import TimerDisplay from "@/components/TimerDisplay";
import Toast from "@/components/Toast";
import {
  durationMinutesAtom,
  isActiveAtom,
  remainingTimeAtom,
  stepMinutesAtom,
  targetEndTimeAtom,
  toastMessageAtom,
} from "@/store/atoms";
import { playNotificationSound } from "@/utils/audioUtils";
import { requestNotificationPermissions, sendTimerFinishedNotification } from "@/utils/notifications";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

interface PomodoroTimerProps {
  fontFamilies: string[];
}

export default function PomodoroTimer({ fontFamilies }: PomodoroTimerProps) {
  const stepMinutes = useAtomValue(stepMinutesAtom);
  const [durationMinutes, setDurationMinutes] = useAtom(durationMinutesAtom);
  const [isActive, setIsActive] = useAtom(isActiveAtom);
  const [targetEndTime, setTargetEndTime] = useAtom(targetEndTimeAtom);
  const [remainingTime, setRemainingTime] = useAtom(remainingTimeAtom);
  const setToastMessage = useSetAtom(toastMessageAtom);

  const [timeLeftMs, setTimeLeftMs] = useState(durationMinutes * 60 * 1000);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const completingRef = useRef(false);

  const handleTimerComplete = useCallback(async () => {
    if (completingRef.current) return;
    completingRef.current = true;

    setIsActive(false);
    setTargetEndTime(null);
    setRemainingTime(null);
    setTimeLeftMs(durationMinutes * 60 * 1000);

    try {
      await deactivateKeepAwake("timo-timer");
    } catch {
      // ignore if wake lock was never activated
    }

    await sendTimerFinishedNotification();
    await playNotificationSound();

    completingRef.current = false;
  }, [
    durationMinutes,
    setIsActive,
    setRemainingTime,
    setTargetEndTime,
  ]);

  useEffect(() => {
    if (isActive && targetEndTime) {
      const remaining = Math.max(0, targetEndTime - Date.now());
      setTimeLeftMs(remaining);
      if (remaining <= 0) {
        void handleTimerComplete();
      }
    } else if (remainingTime !== null) {
      setTimeLeftMs(remainingTime);
    } else {
      setTimeLeftMs(durationMinutes * 60 * 1000);
    }

    void requestNotificationPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isActive && remainingTime === null) {
      setTimeLeftMs(durationMinutes * 60 * 1000);
    }
  }, [durationMinutes, isActive, remainingTime]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let keepAwakeActive = false;

    if (isActive && targetEndTime) {
      void activateKeepAwakeAsync("timo-timer")
        .then(() => {
          keepAwakeActive = true;
        })
        .catch(() => undefined);
      interval = setInterval(() => {
        const diff = targetEndTime - Date.now();
        if (diff <= 0) {
          void handleTimerComplete();
        } else {
          setTimeLeftMs(diff);
        }
      }, 50);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (keepAwakeActive || isActive) {
        deactivateKeepAwake("timo-timer").catch(() => undefined);
      }
    };
  }, [handleTimerComplete, isActive, targetEndTime]);

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
    setRemainingTime(null);
    setTargetEndTime(null);
    setTimeLeftMs(newDuration * 60 * 1000);
  };

  const toggleTimer = () => {
    if (!isActive) {
      const duration =
        remainingTime !== null ? remainingTime : durationMinutes * 60 * 1000;
      const target = Date.now() + duration;

      setTargetEndTime(target);
      setRemainingTime(null);
      setIsActive(true);
      activateKeepAwakeAsync("timo-timer").catch(() => undefined);
    } else {
      if (targetEndTime) {
        const remaining = Math.max(0, targetEndTime - Date.now());
        setRemainingTime(remaining);
      }
      setTargetEndTime(null);
      setIsActive(false);
      deactivateKeepAwake("timo-timer").catch(() => undefined);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTargetEndTime(null);
    setRemainingTime(null);
    setTimeLeftMs(durationMinutes * 60 * 1000);
    deactivateKeepAwake("timo-timer").catch(() => undefined);
  };

  return (
    <View style={styles.root}>
      <TimerDisplay timeLeftMs={timeLeftMs} fontFamilies={fontFamilies} />

      <BottomControls
        isActive={isActive}
        onToggle={toggleTimer}
        onReset={resetTimer}
        onIncrement={() => adjustTime("increment")}
        onDecrement={() => adjustTime("decrement")}
        onSettingsToggle={() => setIsSettingsOpen((open) => !open)}
        isSettingsOpen={isSettingsOpen}
      />

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
