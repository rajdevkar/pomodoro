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
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

interface TimerDisplayProps {
  timeLeftMs: number;
  editable: boolean;
  onDurationChange: (milliseconds: number) => void;
}

export default function TimerDisplay({
  timeLeftMs,
  editable,
  onDurationChange,
}: TimerDisplayProps) {
  const theme = useAtomValue(themeAtom);
  const fontIndex = useAtomValue(fontIndexAtom);
  const fontSizePercent = useAtomValue(fontSizePercentAtom);
  const hapticsEnabled = useAtomValue(hapticsEnabledAtom);

  const { height, width } = Dimensions.get("window");
  const fontSize = Math.min(
    Math.max((fontSizePercent / 100) * height * 0.22, 36),
    width * 0.28,
  );
  const itemHeight = Math.round(fontSize * 1.05);

  const isDark = theme === "dark";
  const family = fontFamilies[fontIndex] ?? fontFamilies[0];
  const color = isDark ? "#ffffff" : "#000000";
  const { minutes, seconds } = splitTime(timeLeftMs);

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
      <View style={styles.row}>
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
        <Text
          style={[
            styles.colon,
            {
              color,
              fontSize,
              fontFamily: family,
              height: itemHeight,
              lineHeight: itemHeight,
            },
          ]}
        >
          :
        </Text>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  colon: {
    letterSpacing: -2,
    marginHorizontal: 2,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
