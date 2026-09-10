import "react-native-gesture-handler";
import JotaiProvider from "@/components/JotaiProvider";
import { themeAtom } from "@/store/atoms";
import { Fascinate_400Regular } from "@expo-google-fonts/fascinate";
import {
  Orbitron_400Regular,
  Orbitron_700Bold,
} from "@expo-google-fonts/orbitron";
import {
  Outfit_400Regular,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import { Sixtyfour_400Regular } from "@expo-google-fonts/sixtyfour";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtomValue } from "jotai";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function ThemedStatusBar() {
  const theme = useAtomValue(themeAtom);
  // "light" = light icons (for dark backgrounds); "dark" = dark icons (for light backgrounds)
  return <StatusBar style={theme === "dark" ? "light" : "dark"} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
    Outfit_400Regular,
    Outfit_700Bold,
    Fascinate_400Regular,
    Sixtyfour_400Regular,
    Orbitron_400Regular,
    Orbitron_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <JotaiProvider>
          <ThemedStatusBar />
          <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
        </JotaiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
