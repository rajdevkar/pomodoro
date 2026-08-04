import { themeAtom } from "@/store/atoms";
import { useAtomValue } from "jotai";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CloseIcon from "./icons/CloseIcon";
import MinusIcon from "./icons/MinusIcon";
import PauseIcon from "./icons/PauseIcon";
import PlayIcon from "./icons/PlayIcon";
import PlusIcon from "./icons/PlusIcon";
import ResetIcon from "./icons/ResetIcon";
import SettingsIcon from "./icons/SettingsIcon";
import SettingsControl from "./SettingsControl";

interface BottomControlsProps {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onSettingsToggle: () => void;
  isSettingsOpen: boolean;
}

export default function BottomControls({
  isActive,
  onToggle,
  onReset,
  onIncrement,
  onDecrement,
  onSettingsToggle,
  isSettingsOpen,
}: BottomControlsProps) {
  const theme = useAtomValue(themeAtom);
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";
  const iconColor = isDark ? "#ffffff" : "#000000";

  const buttonStyle = [
    styles.button,
    {
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    },
  ];

  const renderButton = (
    visible: boolean,
    icon: React.ReactNode,
    onPress: () => void,
    label: string,
  ) => (
    <View style={styles.slot}>
      <Pressable
        onPress={onPress}
        accessibilityLabel={label}
        disabled={!visible}
        style={({ pressed }) => [
          ...buttonStyle,
          {
            opacity: visible ? (pressed ? 0.75 : 1) : 0,
            transform: [{ scale: pressed && visible ? 0.95 : 1 }],
          },
        ]}
      >
        {icon}
      </Pressable>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(24, insets.bottom + 8), pointerEvents: "box-none" },
      ]}
    >
      <View style={styles.row}>
        {renderButton(!isActive, <ResetIcon color={iconColor} />, onReset, "Reset Timer")}
        {renderButton(
          !isActive,
          <MinusIcon color={iconColor} />,
          onDecrement,
          "Decrease Time",
        )}

        <View style={styles.slot}>
          <Pressable
            onPress={onToggle}
            accessibilityLabel={isActive ? "Pause Timer" : "Start Timer"}
            style={({ pressed }) => [
              ...buttonStyle,
              styles.primaryButton,
              {
                opacity: pressed ? 0.75 : 1,
                transform: [{ scale: pressed ? 0.95 : 1.08 }],
              },
            ]}
          >
            {isActive ? (
              <PauseIcon color={iconColor} />
            ) : (
              <PlayIcon color={iconColor} />
            )}
          </Pressable>
        </View>

        {renderButton(
          !isActive,
          <PlusIcon color={iconColor} />,
          onIncrement,
          "Increase Time",
        )}

        <View style={styles.slot}>
          <Pressable
            onPress={onSettingsToggle}
            accessibilityLabel="Settings"
            style={({ pressed }) => [
              ...buttonStyle,
              {
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
        </View>
      </View>

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
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  slot: {
    flex: 1,
    alignItems: "center",
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    width: 60,
    height: 60,
  },
});
