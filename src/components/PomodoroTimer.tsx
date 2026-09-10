import BottomControls from "@/components/BottomControls";
import GestureSurface from "@/components/GestureSurface";
import SettingsScreen from "@/components/SettingsScreen";
import TimerDisplay from "@/components/TimerDisplay";
import Toast from "@/components/Toast";
import {
  durationMsAtom,
  endSoundAtom,
  hapticsEnabledAtom,
  isActiveAtom,
  remainingTimeAtom,
  targetEndTimeAtom,
  tickingSoundAtom,
  toastMessageAtom,
} from "@/store/atoms";
import { playEndSound, playTickSound } from "@/utils/audioUtils";
import {
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerSuccessHaptic,
} from "@/utils/haptics";
import {
  requestNotificationPermissions,
  sendTimerFinishedNotification,
} from "@/utils/notifications";
import { clampDurationMs } from "@/utils/timeUtils";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function PomodoroTimer() {
  const [durationMs, setDurationMs] = useAtom(durationMsAtom);
  const [isActive, setIsActive] = useAtom(isActiveAtom);
  const [targetEndTime, setTargetEndTime] = useAtom(targetEndTimeAtom);
  const [remainingTime, setRemainingTime] = useAtom(remainingTimeAtom);
  const hapticsEnabled = useAtomValue(hapticsEnabledAtom);
  const tickingSound = useAtomValue(tickingSoundAtom);
  const endSound = useAtomValue(endSoundAtom);
  const setToastMessage = useSetAtom(toastMessageAtom);

  const [timeLeftMs, setTimeLeftMs] = useState(durationMs);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const completingRef = useRef(false);
  const lastTickSecondRef = useRef<number | null>(null);

  const haptic = useCallback(
    (intensity: "light" | "medium" = "light") => {
      if (!hapticsEnabled) return;
      if (intensity === "medium") {
        void triggerMediumHaptic();
      } else {
        void triggerLightHaptic();
      }
    },
    [hapticsEnabled],
  );

  const handleTimerComplete = useCallback(async () => {
    if (completingRef.current) return;
    completingRef.current = true;

    setIsActive(false);
    setTargetEndTime(null);
    setRemainingTime(null);
    setTimeLeftMs(durationMs);
    lastTickSecondRef.current = null;

    try {
      await deactivateKeepAwake("timo-timer");
    } catch {
      // ignore if wake lock was never activated
    }

    await sendTimerFinishedNotification();
    await playEndSound(endSound);
    if (hapticsEnabled) {
      await triggerSuccessHaptic();
    }

    completingRef.current = false;
  }, [
    durationMs,
    endSound,
    hapticsEnabled,
    setIsActive,
    setRemainingTime,
    setTargetEndTime,
  ]);

  useEffect(() => {
    if (isActive && targetEndTime) {
      const remaining = Math.max(0, targetEndTime - Date.now());
      setTimeLeftMs(remaining);
      lastTickSecondRef.current = Math.ceil(remaining / 1000);
      if (remaining <= 0) {
        void handleTimerComplete();
      }
    } else if (remainingTime !== null) {
      setTimeLeftMs(remainingTime);
    } else {
      setTimeLeftMs(durationMs);
    }

    void requestNotificationPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isActive && remainingTime === null) {
      setTimeLeftMs(durationMs);
    }
  }, [durationMs, isActive, remainingTime]);

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

          const currentSecond = Math.ceil(diff / 1000);
          if (
            tickingSound !== "off" &&
            lastTickSecondRef.current !== null &&
            currentSecond < lastTickSecondRef.current
          ) {
            void playTickSound(tickingSound);
          }
          lastTickSecondRef.current = currentSecond;
        }
      }, 50);
    } else {
      lastTickSecondRef.current = null;
    }

    return () => {
      if (interval) clearInterval(interval);
      if (keepAwakeActive || isActive) {
        deactivateKeepAwake("timo-timer").catch(() => undefined);
      }
    };
  }, [handleTimerComplete, isActive, targetEndTime, tickingSound]);

  const setDurationFromPicker = useCallback(
    (milliseconds: number) => {
      if (isActive) return;
      const next = clampDurationMs(milliseconds);
      setDurationMs(next);
      setRemainingTime(null);
      setTargetEndTime(null);
      setTimeLeftMs(next);
    },
    [isActive, setDurationMs, setRemainingTime, setTargetEndTime],
  );

  const toggleTimer = useCallback(() => {
    haptic("medium");

    if (!isActive) {
      const duration = remainingTime !== null ? remainingTime : durationMs;
      const target = Date.now() + duration;

      setTargetEndTime(target);
      setRemainingTime(null);
      setIsActive(true);
      lastTickSecondRef.current = Math.ceil(duration / 1000);
      activateKeepAwakeAsync("timo-timer").catch(() => undefined);
    } else {
      if (targetEndTime) {
        const remaining = Math.max(0, targetEndTime - Date.now());
        setRemainingTime(remaining);
      }
      setTargetEndTime(null);
      setIsActive(false);
      lastTickSecondRef.current = null;
      deactivateKeepAwake("timo-timer").catch(() => undefined);
    }
  }, [
    durationMs,
    haptic,
    isActive,
    remainingTime,
    setIsActive,
    setRemainingTime,
    setTargetEndTime,
    targetEndTime,
  ]);

  const resetTimer = useCallback(() => {
    haptic("light");
    setIsActive(false);
    setTargetEndTime(null);
    setRemainingTime(null);
    setTimeLeftMs(durationMs);
    lastTickSecondRef.current = null;
    deactivateKeepAwake("timo-timer").catch(() => undefined);
    setToastMessage("Reset");
  }, [
    durationMs,
    haptic,
    setIsActive,
    setRemainingTime,
    setTargetEndTime,
    setToastMessage,
  ]);

  const toggleSettings = useCallback(() => {
    haptic("light");
    setIsSettingsOpen((open) => !open);
  }, [haptic]);

  return (
    <View style={styles.root}>
      <GestureSurface
        enabled={!isSettingsOpen}
        onTap={toggleTimer}
        onLongPress={resetTimer}
      >
        <TimerDisplay
          timeLeftMs={timeLeftMs}
          editable={!isActive}
          onDurationChange={setDurationFromPicker}
        />
      </GestureSurface>

      <BottomControls
        onOpenSettings={toggleSettings}
        showGestureHint={!isActive}
      />

      <Toast />

      <SettingsScreen isOpen={isSettingsOpen} onClose={toggleSettings} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
