import { fontNames } from "@/constants/timerConstants";
import {
  fontIndexAtom,
  fontSizePercentAtom,
  themeAtom,
} from "@/store/atoms";
import { formatTime } from "@/utils/timeUtils";
import { useAtomValue } from "jotai";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

interface TimerDisplayProps {
  timeLeftMs: number;
  fontFamilies: string[];
}

export default function TimerDisplay({
  timeLeftMs,
  fontFamilies,
}: TimerDisplayProps) {
  const theme = useAtomValue(themeAtom);
  const fontIndex = useAtomValue(fontIndexAtom);
  const fontSizePercent = useAtomValue(fontSizePercentAtom);

  const { height, width } = Dimensions.get("window");
  const fontSize = Math.min(
    Math.max((fontSizePercent / 100) * height * 0.22, 36),
    width * 0.28,
  );

  const isDark = theme === "dark";
  const family = fontFamilies[fontIndex] ?? fontFamilies[0];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#ffffff" },
      ]}
    >
      <Text
        style={[
          styles.timer,
          {
            color: isDark ? "#ffffff" : "#000000",
            fontSize,
            fontFamily: family,
            // Fascinate / display fonts look better slightly lighter weight
            fontWeight: fontNames[fontIndex] === "Fascinate" ? "400" : "700",
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatTime(timeLeftMs)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  timer: {
    letterSpacing: -2,
    fontVariant: ["tabular-nums"],
  },
});
