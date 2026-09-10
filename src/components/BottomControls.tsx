import { hapticsEnabledAtom, themeAtom } from "@/store/atoms";
import { triggerLightHaptic } from "@/utils/haptics";
import { useAtomValue } from "jotai";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SettingsIcon from "./icons/SettingsIcon";

interface BottomControlsProps {
  onOpenSettings: () => void;
  showGestureHint?: boolean;
}

export default function BottomControls({
  onOpenSettings,
  showGestureHint = true,
}: BottomControlsProps) {
  const theme = useAtomValue(themeAtom);
  const hapticsEnabled = useAtomValue(hapticsEnabledAtom);
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";
  const iconColor = isDark ? "#ffffff" : "#000000";

  const openSettings = () => {
    if (hapticsEnabled) void triggerLightHaptic();
    onOpenSettings();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(20, insets.bottom + 6),
          pointerEvents: "box-none",
        },
      ]}
    >
      {showGestureHint ? (
        <Text
          style={[
            styles.hint,
            { color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" },
          ]}
        >
          Tap to start · Swipe ↕ time · Hold reset · Swipe ↔ menu
        </Text>
      ) : null}

      <Pressable
        onPress={openSettings}
        accessibilityLabel="Settings"
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(0,0,0,0.06)",
            opacity: pressed ? 0.75 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <SettingsIcon color={iconColor} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  hint: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.1,
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 16,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
