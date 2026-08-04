import { fontNames, stepOptions } from "@/constants/timerConstants";
import {
  durationMinutesAtom,
  fontIndexAtom,
  fontSizePercentAtom,
  stepMinutesAtom,
  themeAtom,
} from "@/store/atoms";
import Slider from "@react-native-community/slider";
import { useAtom } from "jotai";
import React from "react";
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SettingsControlProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsControl({
  isOpen,
  onClose,
}: SettingsControlProps) {
  const insets = useSafeAreaInsets();
  const [theme, setTheme] = useAtom(themeAtom);
  const [fontIndex, setFontIndex] = useAtom(fontIndexAtom);
  const [fontSizePercent, setFontSizePercent] = useAtom(fontSizePercentAtom);
  const [stepMinutes, setStepMinutes] = useAtom(stepMinutesAtom);
  const [durationMinutes, setDurationMinutes] = useAtom(durationMinutesAtom);

  const isDark = theme === "dark";

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: isDark
                ? "rgba(24,24,27,0.96)"
                : "rgba(255,255,255,0.96)",
              borderColor: isDark ? "#3f3f46" : "#e4e4e7",
              marginBottom: Math.max(24, insets.bottom + 8),
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.section}>
              <Text style={[styles.label, isDark && styles.labelDark]}>
                Step Amount (Minutes)
              </Text>
              <View
                style={[
                  styles.segment,
                  { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" },
                ]}
              >
                {stepOptions.map((step) => {
                  const selected = stepMinutes === step;
                  return (
                    <Pressable
                      key={step}
                      onPress={() => setStepMinutes(step)}
                      style={[
                        styles.segmentItem,
                        selected && {
                          backgroundColor: isDark ? "#3f3f46" : "#ffffff",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          { color: isDark ? "#ffffff" : "#000000" },
                          !selected && styles.dimmed,
                        ]}
                      >
                        {step}m
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={[styles.label, isDark && styles.labelDark]}>
                  Timer Duration
                </Text>
                <Text
                  style={[
                    styles.value,
                    { color: isDark ? "#ffffff" : "#000000" },
                  ]}
                >
                  {durationMinutes}m
                </Text>
              </View>
              <Slider
                minimumValue={1}
                maximumValue={60}
                step={1}
                value={durationMinutes}
                onValueChange={(value) => setDurationMinutes(Math.round(value))}
                minimumTrackTintColor={isDark ? "#ffffff" : "#000000"}
                maximumTrackTintColor={
                  isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"
                }
                thumbTintColor={isDark ? "#ffffff" : "#000000"}
              />
            </View>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                },
              ]}
            />

            <View style={styles.section}>
              <Text style={[styles.label, isDark && styles.labelDark]}>
                Font Family
              </Text>
              <View style={styles.fontGrid}>
                {fontNames.map((name, i) => {
                  const selected = fontIndex === i;
                  return (
                    <Pressable
                      key={name}
                      onPress={() => setFontIndex(i)}
                      style={[
                        styles.fontButton,
                        selected && {
                          backgroundColor: isDark ? "#ffffff" : "#000000",
                          borderColor: isDark ? "#ffffff" : "#000000",
                        },
                        !selected && { borderColor: "transparent" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.fontButtonText,
                          {
                            color: selected
                              ? isDark
                                ? "#000000"
                                : "#ffffff"
                              : isDark
                                ? "#ffffff"
                                : "#000000",
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={[styles.label, isDark && styles.labelDark]}>
                  Font Size
                </Text>
                <Text
                  style={[
                    styles.value,
                    { color: isDark ? "#ffffff" : "#000000" },
                  ]}
                >
                  {fontSizePercent}%
                </Text>
              </View>
              <Slider
                minimumValue={20}
                maximumValue={100}
                step={1}
                value={fontSizePercent}
                onValueChange={(value) =>
                  setFontSizePercent(Math.round(value))
                }
                minimumTrackTintColor={isDark ? "#ffffff" : "#000000"}
                maximumTrackTintColor={
                  isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"
                }
                thumbTintColor={isDark ? "#ffffff" : "#000000"}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, isDark && styles.labelDark]}>
                Theme
              </Text>
              <View
                style={[
                  styles.segment,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
              >
                {(["light", "dark"] as const).map((t) => {
                  const selected = theme === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setTheme(t)}
                      style={[
                        styles.segmentItem,
                        selected && {
                          backgroundColor: isDark ? "#3f3f46" : "#ffffff",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          styles.capitalize,
                          { color: isDark ? "#ffffff" : "#000000" },
                          !selected && styles.dimmed,
                        ]}
                      >
                        {t}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              onPress={() =>
                Linking.openURL("https://buymeacoffee.com/rajdevkar")
              }
              style={styles.coffeeButton}
            >
              <Text style={styles.coffeeText}>Buy me a coffee</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  sheet: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "70%",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  content: {
    padding: 24,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "rgba(0,0,0,0.5)",
  },
  labelDark: {
    color: "rgba(255,255,255,0.5)",
  },
  value: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.7,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  segment: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "500",
  },
  capitalize: {
    textTransform: "capitalize",
  },
  dimmed: {
    opacity: 0.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  fontGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  fontButton: {
    width: "48%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  fontButtonText: {
    fontSize: 14,
    textAlign: "center",
  },
  coffeeButton: {
    backgroundColor: "#FFDD00",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  coffeeText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 14,
  },
});
