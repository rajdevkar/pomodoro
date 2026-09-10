import TimeColumn from "@/components/TimeColumn";
import { fontFamilies, timerLayout } from "@/constants/timerConstants";
import {
  fontIndexAtom,
  fontSizePercentAtom,
  hapticsEnabledAtom,
  themeAtom,
} from "@/store/atoms";
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
  const fontIndex = useAtomValue(fontIndexAtom);
  const fontSizePercent = useAtomValue(fontSizePercentAtom);
  const hapticsEnabled = useAtomValue(hapticsEnabledAtom);
  const colonOpacity = useRef(new Animated.Value(1)).current;

  const { height, width } = Dimensions.get("window");
  const {
    fontSize,
    itemHeight,
    columnWidth,
    colonWidth,
    timeWidth,
    neighborSize,
    neighborStride,
    baselineNudge,
  } = timerLayout(fontIndex, width, height, fontSizePercent);

  const isDark = theme === "dark";
  const family = fontFamilies[fontIndex] ?? fontFamilies[0];
  const color = isDark ? "#ffffff" : "#000000";
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

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#ffffff" },
      ]}
    >
      <View style={[styles.stage, { width: timeWidth, height: itemHeight }]}>
        <View
          pointerEvents="none"
          style={[
            styles.selection,
            {
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
          neighborSize={neighborSize}
          neighborStride={neighborStride}
          baselineNudge={baselineNudge}
          color={color}
          hapticsEnabled={hapticsEnabled}
          onChange={(nextMinutes) => applyParts(nextMinutes, seconds)}
        />
        <View style={[styles.colonSlot, { width: colonWidth, height: itemHeight }]}>
          <Animated.Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.55}
            style={[
              styles.colon,
              {
                color,
                fontSize,
                fontFamily: family,
                opacity: colonOpacity,
                transform: [{ translateY: baselineNudge }],
              },
            ]}
          >
            :
          </Animated.Text>
        </View>
        <TimeColumn
          value={seconds}
          min={0}
          max={minutes >= 60 ? 0 : 59}
          enabled={editable}
          itemHeight={itemHeight}
          columnWidth={columnWidth}
          fontSize={fontSize}
          fontFamily={family}
          neighborSize={neighborSize}
          neighborStride={neighborStride}
          baselineNudge={baselineNudge}
          color={color}
          hapticsEnabled={hapticsEnabled}
          onChange={(nextSeconds) => applyParts(minutes, nextSeconds)}
        />
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
    ...StyleSheet.absoluteFill,
    left: -20,
    right: -20,
    borderRadius: 22,
  },
  colonSlot: {
    alignItems: "center",
    justifyContent: "center",
  },
  colon: {
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
