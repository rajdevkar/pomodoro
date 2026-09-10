import PomodoroTimer from "@/components/PomodoroTimer";
import { themeAtom } from "@/store/atoms";
import { StatusBar } from "expo-status-bar";
import { Provider, useAtomValue } from "jotai";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

function ThemedApp() {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === "dark";

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: isDark ? "#000000" : "#ffffff" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <PomodoroTimer />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider>
        <ThemedApp />
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
