import { fontFamilies, fontNames } from "@/constants/timerConstants";
import {
  fontIndexAtom,
  fontSizePercentAtom,
  themeAtom,
} from "@/store/atoms";
import { formatTime } from "@/utils/timeUtils";
import { Fascinate_400Regular } from "@expo-google-fonts/fascinate";
import { Orbitron_700Bold } from "@expo-google-fonts/orbitron";
import { Outfit_700Bold } from "@expo-google-fonts/outfit";
import { Sixtyfour_400Regular } from "@expo-google-fonts/sixtyfour";
import { SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { useFonts } from "expo-font";
import { useAtomValue } from "jotai";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

interface TimerDisplayProps {
  timeLeftMs: number;
}

export default function TimerDisplay({ timeLeftMs }: TimerDisplayProps) {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_700Bold,
    Outfit_700Bold,
    Fascinate_400Regular,
    Sixtyfour_400Regular,
    Orbitron_700Bold,
  });
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
            fontFamily: fontsLoaded ? family : undefined,
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
