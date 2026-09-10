import { hapticsEnabledAtom, themeAtom } from "@/store/atoms";
import { triggerLightHaptic } from "@/utils/haptics";
import { useAtomValue } from "jotai";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CloseIcon from "./icons/CloseIcon";
import SettingsIcon from "./icons/SettingsIcon";
import SettingsControl from "./SettingsControl";

interface BottomControlsProps {
  onSettingsToggle: () => void;
  isSettingsOpen: boolean;
  showGestureHint?: boolean;
}

export default function BottomControls({
  onSettingsToggle,
  isSettingsOpen,
  showGestureHint = true,
}: BottomControlsProps) {
  const theme = useAtomValue(themeAtom);
  const hapticsEnabled = useAtomValue(hapticsEnabledAtom);
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";
  const iconColor = isDark ? "#ffffff" : "#000000";

  const openSettings = () => {
    if (hapticsEnabled) void triggerLightHaptic();
    onSettingsToggle();
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
            { color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" },
          ]}
        >
          Tap play/pause · Swipe ↕ adjust · Hold reset · Swipe ↔ settings
        </Text>
      ) : null}

      <Pressable
        onPress={openSettings}
        accessibilityLabel="Settings"
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.05)",
            opacity: pressed ? 0.75 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        {isSettingsOpen ? (
          <CloseIcon color={iconColor} />
        ) : (
          <SettingsIcon color={iconColor} />
        )}
      </Pressable>

      <SettingsControl isOpen={isSettingsOpen} onClose={onSettingsToggle} />
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
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.2,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
