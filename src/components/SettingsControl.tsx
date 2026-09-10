import { endSoundOptions, fontNames, stepOptions, tickSoundOptions } from "@/constants/timerConstants";
import {
  durationMinutesAtom,
  endSoundAtom,
  fontIndexAtom,
  fontSizePercentAtom,
  hapticsEnabledAtom,
  stepMinutesAtom,
  themeAtom,
  tickingSoundAtom,
} from "@/store/atoms";
import type { EndSoundId, TickSoundId } from "@/utils/audioUtils";
import { playEndSound, playTickSound } from "@/utils/audioUtils";
import { triggerLightHaptic } from "@/utils/haptics";
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
  const [hapticsEnabled, setHapticsEnabled] = useAtom(hapticsEnabledAtom);
  const [tickingSound, setTickingSound] = useAtom(tickingSoundAtom);
  const [endSound, setEndSound] = useAtom(endSoundAtom);

  const isDark = theme === "dark";

  const withHaptic = (action: () => void) => {
    if (hapticsEnabled) {
      void triggerLightHaptic();
    }
    action();
  };

  const segmentBg = {
    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  };

  const renderSegment = <T extends string>(
    options: readonly { id: T; label: string }[],
    selectedId: T,
    onSelect: (id: T) => void,
    wrap = false,
  ) => (
    <View style={[wrap ? styles.chipRow : styles.segment, segmentBg]}>
      {options.map((option) => {
        const selected = selectedId === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[
              wrap ? styles.chipItem : styles.segmentItem,
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
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

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
              <View style={[styles.segment, segmentBg]}>
                {stepOptions.map((step) => {
                  const selected = stepMinutes === step;
                  return (
                    <Pressable
                      key={step}
                      onPress={() => withHaptic(() => setStepMinutes(step))}
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
                onSlidingComplete={() => {
                  if (hapticsEnabled) void triggerLightHaptic();
                }}
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
                Haptics
              </Text>
              {renderSegment(
                [
                  { id: "on", label: "On" },
                  { id: "off", label: "Off" },
                ] as const,
                hapticsEnabled ? "on" : "off",
                (id) => {
                  const next = id === "on";
                  setHapticsEnabled(next);
                  if (next) void triggerLightHaptic();
                },
              )}
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, isDark && styles.labelDark]}>
                Ticking Sound
              </Text>
              {renderSegment(
                tickSoundOptions,
                tickingSound,
                (id) =>
                  withHaptic(() => {
                    setTickingSound(id);
                    if (id !== "off") void playTickSound(id as TickSoundId);
                  }),
                true,
              )}
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, isDark && styles.labelDark]}>
                Timer End Sound
              </Text>
              {renderSegment(
                endSoundOptions,
                endSound,
                (id) =>
                  withHaptic(() => {
                    setEndSound(id);
                    if (id !== "off") void playEndSound(id as EndSoundId);
                  }),
                true,
              )}
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
                      onPress={() => withHaptic(() => setFontIndex(i))}
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
                onSlidingComplete={() => {
                  if (hapticsEnabled) void triggerLightHaptic();
                }}
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
              <View style={[styles.segment, segmentBg]}>
                {(["light", "dark"] as const).map((t) => {
                  const selected = theme === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => withHaptic(() => setTheme(t))}
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
              onPress={() => {
                if (hapticsEnabled) void triggerLightHaptic();
                Linking.openURL("https://buymeacoffee.com/rajdevkar");
              }}
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
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  chipItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    minWidth: "22%",
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
