import TimeColumn from "@/components/TimeColumn";
import { fontFamilies } from "@/constants/timerConstants";
import {
  fontIndexAtom,
  fontSizePercentAtom,
  hapticsEnabledAtom,
  themeAtom,
} from "@/store/atoms";
import { durationFromParts, splitTime } from "@/utils/timeUtils";
import { useAtomValue } from "jotai";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

interface TimerDisplayProps {
  timeLeftMs: number;
  editable: boolean;
  isActive: boolean;
  isPaused: boolean;
  onDurationChange: (milliseconds: number) => void;
}

export default function TimerDisplay({
  timeLeftMs,
  editable,
  isActive,
  isPaused,
  onDurationChange,
}: TimerDisplayProps) {
  const theme = useAtomValue(themeAtom);
  const fontIndex = useAtomValue(fontIndexAtom);
  const fontSizePercent = useAtomValue(fontSizePercentAtom);
  const hapticsEnabled = useAtomValue(hapticsEnabledAtom);
  const colonOpacity = useRef(new Animated.Value(1)).current;

  const { height, width } = Dimensions.get("window");
  const fontSize = Math.min(
    Math.max((fontSizePercent / 100) * height * 0.2, 40),
    width * 0.24,
  );
  const itemHeight = Math.round(fontSize * 0.98);
  const columnWidth = Math.round(fontSize * 1.22);
  const colonWidth = Math.round(fontSize * 0.42);

  const isDark = theme === "dark";
  const family = fontFamilies[fontIndex] ?? fontFamilies[0];
  const color = isDark ? "#ffffff" : "#000000";
  const muted = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";
  const { minutes, seconds } = splitTime(timeLeftMs);

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

  const status = isActive ? "Focus" : isPaused ? "Paused" : "Ready";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#ffffff" },
      ]}
    >
      <View style={styles.cluster}>
        <Text style={[styles.status, { color: muted }]}>{status}</Text>

        <View style={[styles.timeBlock, { height: itemHeight }]}>
          <View
            pointerEvents="none"
            style={[
              styles.selection,
              {
                height: itemHeight,
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
            fontFamily={family}
            color={color}
            hapticsEnabled={hapticsEnabled}
            onChange={(nextMinutes) => applyParts(nextMinutes, seconds)}
          />
          <Animated.Text
            style={[
              styles.colon,
              {
                color,
                fontSize,
                fontFamily: family,
                width: colonWidth,
                height: itemHeight,
                lineHeight: itemHeight,
                opacity: colonOpacity,
              },
            ]}
          >
            :
          </Animated.Text>
          <TimeColumn
            value={seconds}
            min={0}
            max={minutes >= 60 ? 0 : 59}
            enabled={editable}
            itemHeight={itemHeight}
            columnWidth={columnWidth}
            fontSize={fontSize}
            fontFamily={family}
            color={color}
            hapticsEnabled={hapticsEnabled}
            onChange={(nextSeconds) => applyParts(minutes, nextSeconds)}
          />
        </View>

        <View style={styles.labels}>
          <Text style={[styles.unitLabel, { width: columnWidth, color: muted }]}>
            min
          </Text>
          <View style={{ width: colonWidth }} />
          <Text style={[styles.unitLabel, { width: columnWidth, color: muted }]}>
            sec
          </Text>
        </View>
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
  cluster: {
    alignItems: "center",
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  timeBlock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  selection: {
    position: "absolute",
    left: -14,
    right: -14,
    borderRadius: 20,
  },
  colon: {
    textAlign: "center",
    letterSpacing: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  labels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  unitLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    textAlign: "center",
  },
});
