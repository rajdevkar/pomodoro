import "react-native-gesture-handler";
import PomodoroTimer from "@/components/PomodoroTimer";
import { themeAtom } from "@/store/atoms";
import { Fascinate_400Regular } from "@expo-google-fonts/fascinate";
import { Orbitron_700Bold } from "@expo-google-fonts/orbitron";
import { Outfit_700Bold } from "@expo-google-fonts/outfit";
import { SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { VT323_400Regular } from "@expo-google-fonts/vt323";
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
    Outfit_700Bold,
    Fascinate_400Regular,
    VT323_400Regular,
    Orbitron_700Bold,
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
