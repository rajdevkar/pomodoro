import PomodoroTimer from "@/components/PomodoroTimer";
import { fontFamilies } from "@/constants/timerConstants";
import { themeAtom } from "@/store/atoms";
import { useAtomValue } from "jotai";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === "dark";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#ffffff" },
      ]}
    >
      <PomodoroTimer fontFamilies={fontFamilies} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
