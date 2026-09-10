import { hapticsEnabledAtom, themeAtom } from "@/store/atoms";
import { triggerLightHaptic } from "@/utils/haptics";
import { useAtomValue } from "jotai";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SettingsIcon from "./icons/SettingsIcon";

interface BottomControlsProps {
  onOpenSettings: () => void;
  isActive: boolean;
  isPaused: boolean;
}

export default function BottomControls({
  onOpenSettings,
  isActive,
  isPaused,
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

  const hintParts = isActive
    ? ["Tap to pause"]
    : isPaused
      ? ["Tap to resume", "Hold to reset"]
      : ["Scroll to set", "Tap to start"];

  return (
    <>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: Math.max(12, insets.top + 4),
            pointerEvents: "box-none",
          },
        ]}
      >
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
          <SettingsIcon color={iconColor} />
        </Pressable>
      </View>

      <View
        style={[
          styles.hintBar,
          {
            paddingBottom: Math.max(22, insets.bottom + 8),
            pointerEvents: "none",
          },
        ]}
      >
        <View style={styles.hintRow}>
          {hintParts.map((part, index) => (
            <React.Fragment key={part}>
              {index > 0 ? (
                <Text
                  style={[
                    styles.hint,
                    styles.hintDot,
                    {
                      color: isDark
                        ? "rgba(255,255,255,0.45)"
                        : "rgba(0,0,0,0.42)",
                    },
                  ]}
                >
                  {" "}
                  ·{" "}
                </Text>
              ) : null}
              <Text
                style={[
                  styles.hint,
                  {
                    color: isDark
                      ? "rgba(255,255,255,0.45)"
                      : "rgba(0,0,0,0.42)",
                  },
                ]}
              >
                {part}
              </Text>
            </React.Fragment>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 16,
    alignItems: "flex-end",
  },
  hintBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  hintDot: {
    fontWeight: "400",
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
