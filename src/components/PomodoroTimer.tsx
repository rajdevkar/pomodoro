import BottomControls from "@/components/BottomControls";
import GestureSurface from "@/components/GestureSurface";
import SettingsScreen from "@/components/SettingsScreen";
import TimerDisplay from "@/components/TimerDisplay";
import Toast from "@/components/Toast";
import {
  durationMsAtom,
  endSoundAtom,
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
import {
  scheduleRunningWidgetTimeline,
  subscribeTimerSurfaceInteractions,
  syncTimerSurfaces,
} from "@/utils/timerSurfaces";
import { clampDurationMs } from "@/utils/timeUtils";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, View } from "react-native";

export default function PomodoroTimer() {
  const [durationMs, setDurationMs] = useAtom(durationMsAtom);
  const [isActive, setIsActive] = useAtom(isActiveAtom);
  const [targetEndTime, setTargetEndTime] = useAtom(targetEndTimeAtom);
  const [remainingTime, setRemainingTime] = useAtom(remainingTimeAtom);
  const tickingSound = useAtomValue(tickingSoundAtom);
  const endSound = useAtomValue(endSoundAtom);
  const setToastMessage = useSetAtom(toastMessageAtom);

  const [timeLeftMs, setTimeLeftMs] = useState(durationMs);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const completingRef = useRef(false);
  const lastTickSecondRef = useRef<number | null>(null);
  const applyingWidgetRef = useRef(false);

  const surfaceState = useCallback(
    () => ({
      isActive,
      targetEndTime,
      remainingTime,
      durationMs,
    }),
    [durationMs, isActive, remainingTime, targetEndTime],
  );

  const haptic = useCallback((intensity: "light" | "medium" = "light") => {
    if (intensity === "medium") {
      void triggerMediumHaptic();
    } else {
      void triggerLightHaptic();
    }
  }, []);

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

    syncTimerSurfaces({
      isActive: false,
      targetEndTime: null,
      remainingTime: null,
      durationMs,
    });

    await sendTimerFinishedNotification();
    await playEndSound(endSound);
    await triggerSuccessHaptic();

    completingRef.current = false;
  }, [
    durationMs,
    endSound,
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
    syncTimerSurfaces({
      isActive,
      targetEndTime,
      remainingTime,
      durationMs,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isActive && remainingTime === null) {
      setTimeLeftMs(durationMs);
    }
  }, [durationMs, isActive, remainingTime]);

  useEffect(() => {
    if (applyingWidgetRef.current) return;
    if (isActive && targetEndTime) {
      scheduleRunningWidgetTimeline(surfaceState());
    } else {
      syncTimerSurfaces(surfaceState());
    }
  }, [isActive, remainingTime, surfaceState, targetEndTime]);

  useEffect(() => {
    const subscription = subscribeTimerSurfaceInteractions((next) => {
      applyingWidgetRef.current = true;
      setIsActive(next.isActive);
      setTargetEndTime(next.targetEndTime);
      setRemainingTime(next.remainingTime);

      if (next.isActive && next.targetEndTime) {
        const remaining = Math.max(0, next.targetEndTime - Date.now());
        setTimeLeftMs(remaining);
        lastTickSecondRef.current = Math.ceil(remaining / 1000);
        activateKeepAwakeAsync("timo-timer").catch(() => undefined);
      } else if (next.remainingTime !== null) {
        setTimeLeftMs(next.remainingTime);
        lastTickSecondRef.current = null;
        deactivateKeepAwake("timo-timer").catch(() => undefined);
      } else {
        setTimeLeftMs(durationMs);
        lastTickSecondRef.current = null;
        deactivateKeepAwake("timo-timer").catch(() => undefined);
      }

      requestAnimationFrame(() => {
        applyingWidgetRef.current = false;
      });
    });

    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        syncTimerSurfaces({
          isActive,
          targetEndTime,
          remainingTime,
          durationMs,
        });
      }
    });

    return () => {
      subscription.remove();
      appStateSub.remove();
    };
  }, [
    durationMs,
    isActive,
    remainingTime,
    setIsActive,
    setRemainingTime,
    setTargetEndTime,
    targetEndTime,
  ]);

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
      syncTimerSurfaces({
        isActive: false,
        targetEndTime: null,
        remainingTime: null,
        durationMs: next,
      });
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
      scheduleRunningWidgetTimeline({
        isActive: true,
        targetEndTime: target,
        remainingTime: null,
        durationMs,
      });
    } else {
      let remaining = remainingTime;
      if (targetEndTime) {
        remaining = Math.max(0, targetEndTime - Date.now());
        setRemainingTime(remaining);
      }
      setTargetEndTime(null);
      setIsActive(false);
      lastTickSecondRef.current = null;
      deactivateKeepAwake("timo-timer").catch(() => undefined);
      syncTimerSurfaces({
        isActive: false,
        targetEndTime: null,
        remainingTime: remaining ?? null,
        durationMs,
      });
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
    syncTimerSurfaces({
      isActive: false,
      targetEndTime: null,
      remainingTime: null,
      durationMs,
    });
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
          isActive={isActive}
          onDurationChange={setDurationFromPicker}
        />
      </GestureSurface>

      <BottomControls
        onOpenSettings={toggleSettings}
        isActive={isActive}
        isPaused={!isActive && remainingTime !== null}
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
