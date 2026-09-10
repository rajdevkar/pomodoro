import "react-native-gesture-handler";
import PomodoroTimer from "@/components/PomodoroTimer";
import { themeAtom } from "@/store/atoms";
import { SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { Provider, useAtomValue } from "jotai";
import React from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Provider>
          <ThemedApp />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
