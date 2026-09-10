import TimeColumn from "@/components/TimeColumn";
import { timerFontFamily, timerLayout } from "@/constants/timerConstants";
import { themeAtom } from "@/store/atoms";
import { durationFromParts, splitTime } from "@/utils/timeUtils";
import { useAtomValue } from "jotai";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

interface TimerDisplayProps {
  timeLeftMs: number;
  editable: boolean;
  isActive: boolean;
  onDurationChange: (milliseconds: number) => void;
}

export default function TimerDisplay({
  timeLeftMs,
  editable,
  isActive,
  onDurationChange,
}: TimerDisplayProps) {
  const theme = useAtomValue(themeAtom);
  const colonOpacity = useRef(new Animated.Value(1)).current;

  const { height, width } = Dimensions.get("window");
  const { fontSize, itemHeight, columnWidth, colonWidth, baselineNudge } =
    timerLayout(width, height);

  const isDark = theme === "dark";
  const color = isDark ? "#ffffff" : "#000000";
  const { minutes, seconds } = splitTime(timeLeftMs);
  const wheelHeight = itemHeight * 3;
  const stageWidth = columnWidth * 2 + colonWidth;
  const colonDot = Math.max(3, Math.round(fontSize * 0.14));
  const colonGap = Math.max(4, Math.round(fontSize * 0.16));

  useEffect(() => {
    if (!isActive) {
      colonOpacity.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(colonOpacity, {
          toValue: 0.2,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(colonOpacity, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [colonOpacity, isActive]);

  const applyParts = (nextMinutes: number, nextSeconds: number) => {
    const parts = durationFromParts(nextMinutes, nextSeconds);
    onDurationChange(parts.minutes * 60 * 1000 + parts.seconds * 1000);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#ffffff" },
      ]}
    >
      <View style={[styles.stage, { width: stageWidth, height: wheelHeight }]}>
        <View
          pointerEvents="none"
          style={[
            styles.selection,
            {
              height: itemHeight,
              top: itemHeight,
              left: -Math.round(fontSize * 0.28),
              right: -Math.round(fontSize * 0.28),
              backgroundColor: isDark
                ? "rgba(255,255,255,0.07)"
                : "rgba(0,0,0,0.05)",
            },
          ]}
        />

        <TimeColumn
          value={minutes}
          min={0}
          max={60}
          enabled={editable}
          itemHeight={itemHeight}
          columnWidth={columnWidth}
          fontSize={fontSize}
          fontFamily={timerFontFamily}
          baselineNudge={baselineNudge}
          color={color}
          onChange={(nextMinutes) => applyParts(nextMinutes, seconds)}
        />

        <View style={{ width: colonWidth, height: wheelHeight }} />

        <TimeColumn
          value={seconds}
          min={0}
          max={minutes >= 60 ? 0 : 59}
          enabled={editable}
          itemHeight={itemHeight}
          columnWidth={columnWidth}
          fontSize={fontSize}
          fontFamily={timerFontFamily}
          baselineNudge={baselineNudge}
          color={color}
          onChange={(nextSeconds) => applyParts(minutes, nextSeconds)}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.colonSlot,
            {
              width: colonWidth,
              height: itemHeight,
              top: itemHeight,
              left: columnWidth,
              opacity: colonOpacity,
              transform: [{ translateY: baselineNudge }],
            },
          ]}
        >
          <View
            style={[
              styles.colonDot,
              {
                width: colonDot,
                height: colonDot,
                borderRadius: colonDot / 2,
                backgroundColor: color,
                marginBottom: colonGap,
              },
            ]}
          />
          <View
            style={[
              styles.colonDot,
              {
                width: colonDot,
                height: colonDot,
                borderRadius: colonDot / 2,
                backgroundColor: color,
              },
            ]}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  stage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  selection: {
    position: "absolute",
    borderRadius: 28,
  },
  colonSlot: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  colonDot: {},
});
