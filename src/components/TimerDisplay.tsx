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
    width * 0.26,
  );
  const itemHeight = Math.round(fontSize * 1.08);

  const isDark = theme === "dark";
  const family = fontFamilies[fontIndex] ?? fontFamilies[0];
  const color = isDark ? "#ffffff" : "#000000";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.4)";
  const { minutes, seconds } = splitTime(timeLeftMs);

  useEffect(() => {
    if (!isActive) {
      colonOpacity.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(colonOpacity, {
          toValue: 0.18,
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
      <Text style={[styles.status, { color: muted }]}>{status}</Text>

      <View style={styles.picker}>
        <View
          pointerEvents="none"
          style={[
            styles.selection,
            {
              height: itemHeight,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
              borderColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)",
            },
          ]}
        />

        <View style={styles.row}>
          <View style={styles.unit}>
            <TimeColumn
              value={minutes}
              min={0}
              max={60}
              enabled={editable}
              itemHeight={itemHeight}
              fontSize={fontSize}
              fontFamily={family}
              color={color}
              hapticsEnabled={hapticsEnabled}
              onChange={(nextMinutes) => applyParts(nextMinutes, seconds)}
            />
            <Text style={[styles.unitLabel, { color: muted }]}>min</Text>
          </View>

          <Animated.Text
            style={[
              styles.colon,
              {
                color,
                fontSize,
                fontFamily: family,
                height: itemHeight,
                lineHeight: itemHeight,
                opacity: colonOpacity,
                marginBottom: 22,
              },
            ]}
          >
            :
          </Animated.Text>

          <View style={styles.unit}>
            <TimeColumn
              value={seconds}
              min={0}
              max={minutes >= 60 ? 0 : 59}
              enabled={editable}
              itemHeight={itemHeight}
              fontSize={fontSize}
              fontFamily={family}
              color={color}
              hapticsEnabled={hapticsEnabled}
              onChange={(nextSeconds) => applyParts(minutes, nextSeconds)}
            />
            <Text style={[styles.unitLabel, { color: muted }]}>sec</Text>
          </View>
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
  status: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 18,
  },
  picker: {
    alignItems: "center",
    justifyContent: "center",
  },
  selection: {
    position: "absolute",
    left: -18,
    right: -18,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  unit: {
    alignItems: "center",
  },
  unitLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  colon: {
    letterSpacing: -2,
    marginHorizontal: 6,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
