import { endSoundOptions, fontNames, resolveFontIndex, tickSoundOptions } from "@/constants/timerConstants";
import {
  endSoundAtom,
  fontIndexAtom,
  fontSizePercentAtom,
  themeAtom,
  tickingSoundAtom,
} from "@/store/atoms";
import type { EndSoundId, TickSoundId } from "@/utils/audioUtils";
import { playEndSound, playTickSound } from "@/utils/audioUtils";
import { triggerLightHaptic } from "@/utils/haptics";
import Slider from "@react-native-community/slider";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
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
import CloseIcon from "./icons/CloseIcon";

interface SettingsScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

function Group({
  children,
  isDark,
}: {
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <View
      style={[
        styles.groupShell,
        {
          backgroundColor: isDark ? "#2C2C2E" : "#ffffff",
          borderColor: isDark
            ? "rgba(255,255,255,0.12)"
            : "rgba(0,0,0,0.06)",
        },
      ]}
    >
      {children}
    </View>
  );
}

function GroupHeader({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <Text
      style={[
        styles.groupHeader,
        { color: isDark ? "rgba(235,235,245,0.6)" : "rgba(60,60,67,0.6)" },
      ]}
    >
      {title}
    </Text>
  );
}

function RowDivider({ isDark, inset = 16 }: { isDark: boolean; inset?: number }) {
  return (
    <View
      style={[
        styles.rowDivider,
        {
          marginLeft: inset,
          backgroundColor: isDark
            ? "rgba(84,84,88,0.65)"
            : "rgba(60,60,67,0.18)",
        },
      ]}
    />
  );
}

export default function SettingsScreen({ isOpen, onClose }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const [theme, setTheme] = useAtom(themeAtom);
  const [fontIndex, setFontIndex] = useAtom(fontIndexAtom);
  const [fontSizePercent, setFontSizePercent] = useAtom(fontSizePercentAtom);
  const [tickingSound, setTickingSound] = useAtom(tickingSoundAtom);
  const [endSound, setEndSound] = useAtom(endSoundAtom);

  useEffect(() => {
    const safe = resolveFontIndex(fontIndex);
    if (safe !== fontIndex) setFontIndex(safe);
  }, [fontIndex, setFontIndex]);

  const isDark = theme === "dark";
  const accent = "#0A84FF";
  const labelColor = isDark ? "#ffffff" : "#000000";
  const secondaryColor = isDark
    ? "rgba(235,235,245,0.6)"
    : "rgba(60,60,67,0.6)";

  const withHaptic = (action: () => void) => {
    void triggerLightHaptic();
    action();
  };

  const renderSegment = <T extends string>(
    options: readonly { id: T; label: string }[],
    selectedId: T,
    onSelect: (id: T) => void,
  ) => (
    <View
      style={[
        styles.segment,
        {
          backgroundColor: isDark
            ? "rgba(118,118,128,0.24)"
            : "rgba(118,118,128,0.12)",
        },
      ]}
    >
      {options.map((option) => {
        const selected = selectedId === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[
              styles.segmentItem,
              selected && {
                backgroundColor: isDark ? "#3f3f46" : "#ffffff",
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.segmentText,
                {
                  color: labelColor,
                  opacity: selected ? 1 : 0.55,
                  fontWeight: selected ? "600" : "500",
                },
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
              backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
              borderColor: isDark
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.08)",
              marginBottom: Math.max(24, insets.bottom + 8),
            },
          ]}
        >
          <View style={styles.header}>
            <View
              style={[
                styles.grabber,
                {
                  backgroundColor: isDark
                    ? "rgba(235,235,245,0.3)"
                    : "rgba(60,60,67,0.3)",
                },
              ]}
            />
            <View style={styles.headerRow}>
              <Text style={[styles.headerTitle, { color: labelColor }]}>
                Settings
              </Text>
              <Pressable
                onPress={onClose}
                accessibilityLabel="Close settings"
                hitSlop={12}
                style={({ pressed }) => [
                  styles.closeButton,
                  {
                    backgroundColor: isDark
                      ? "rgba(118,118,128,0.24)"
                      : "rgba(118,118,128,0.12)",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <CloseIcon color={labelColor} size={18} />
              </Pressable>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <GroupHeader title="Feedback & Sound" isDark={isDark} />
            <Group isDark={isDark}>
              <View style={styles.rowBlock}>
                <Text style={[styles.rowLabel, { color: labelColor }]}>
                  Tick sound
                </Text>
                {renderSegment(tickSoundOptions, tickingSound, (id) =>
                  withHaptic(() => {
                    setTickingSound(id);
                    if (id !== "off") void playTickSound(id as TickSoundId);
                  }),
                )}
              </View>
              <RowDivider isDark={isDark} />
              <View style={styles.rowBlock}>
                <Text style={[styles.rowLabel, { color: labelColor }]}>
                  End sound
                </Text>
                {renderSegment(endSoundOptions, endSound, (id) =>
                  withHaptic(() => {
                    setEndSound(id);
                    if (id !== "off") void playEndSound(id as EndSoundId);
                  }),
                )}
              </View>
            </Group>

            <GroupHeader title="Appearance" isDark={isDark} />
            <Group isDark={isDark}>
              <View style={styles.rowBlock}>
                <Text style={[styles.rowLabel, { color: labelColor }]}>
                  Font
                </Text>
                <View style={styles.fontGrid}>
                  {fontNames.map((name, i) => {
                    const selected = resolveFontIndex(fontIndex) === i;
                    return (
                      <Pressable
                        key={name}
                        onPress={() => withHaptic(() => setFontIndex(i))}
                        style={[
                          styles.fontChip,
                          {
                            backgroundColor: selected
                              ? accent
                              : isDark
                                ? "rgba(118,118,128,0.24)"
                                : "rgba(118,118,128,0.12)",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.fontChipText,
                            {
                              color: selected ? "#ffffff" : labelColor,
                              opacity: selected ? 1 : 0.7,
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
              <RowDivider isDark={isDark} />
              <View style={styles.rowBlock}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.rowLabel, { color: labelColor }]}>
                    Size
                  </Text>
                  <Text style={[styles.rowValue, { color: secondaryColor }]}>
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
                    void triggerLightHaptic();
                  }}
                  minimumTrackTintColor={accent}
                  maximumTrackTintColor={
                    isDark ? "rgba(120,120,128,0.36)" : "rgba(120,120,128,0.2)"
                  }
                  thumbTintColor="#ffffff"
                />
              </View>
              <RowDivider isDark={isDark} />
              <View style={styles.rowBlock}>
                <Text style={[styles.rowLabel, { color: labelColor }]}>
                  Theme
                </Text>
                {renderSegment(
                  [
                    { id: "light", label: "Light" },
                    { id: "dark", label: "Dark" },
                  ] as const,
                  theme,
                  (id) => withHaptic(() => setTheme(id)),
                )}
              </View>
            </Group>

            <GroupHeader title="How to use" isDark={isDark} />
            <Group isDark={isDark}>
              <View style={styles.rowBlock}>
                {(
                  [
                    ["Tap", "Start, pause, or resume"],
                    ["Scroll minutes or seconds", "Set the duration"],
                    ["Hold", "Reset"],
                  ] as const
                ).map(([gesture, action], index, list) => (
                  <React.Fragment key={gesture}>
                    <View style={styles.helpRow}>
                      <Text style={[styles.helpGesture, { color: labelColor }]}>
                        {gesture}
                      </Text>
                      <Text
                        style={[styles.helpAction, { color: secondaryColor }]}
                      >
                        {action}
                      </Text>
                    </View>
                    {index < list.length - 1 ? (
                      <RowDivider isDark={isDark} inset={0} />
                    ) : null}
                  </React.Fragment>
                ))}
              </View>
            </Group>

            <GroupHeader title="Support" isDark={isDark} />
            <Group isDark={isDark}>
              <Pressable
                onPress={() => {
                  void triggerLightHaptic();
                  Linking.openURL("https://buymeacoffee.com/rajdevkar");
                }}
                style={({ pressed }) => [
                  styles.supportRow,
                  { opacity: pressed ? 0.65 : 1 },
                ]}
              >
                <Text style={[styles.rowLabel, { color: accent }]}>
                  Buy me a coffee
                </Text>
                <Text style={[styles.chevron, { color: secondaryColor }]}>
                  ›
                </Text>
              </Pressable>
            </Group>
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
    maxWidth: 400,
    maxHeight: "78%",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 8,
  },
  groupHeader: {
    fontSize: 13,
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 12,
    marginBottom: 6,
    marginLeft: 16,
  },
  groupShell: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowBlock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: "400",
  },
  rowValue: {
    fontSize: 17,
    fontWeight: "400",
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
  },
  segment: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 10,
    padding: 2,
    gap: 2,
  },
  segmentItem: {
    flexGrow: 1,
    flexBasis: "31%",
    minWidth: 72,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: {
    fontSize: 13,
    textAlign: "center",
  },
  fontGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  fontChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  fontChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  helpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    gap: 12,
  },
  helpGesture: {
    fontSize: 17,
    fontWeight: "400",
    flexShrink: 0,
  },
  helpAction: {
    fontSize: 17,
    fontWeight: "400",
    textAlign: "right",
    flex: 1,
  },
  supportRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chevron: {
    fontSize: 22,
    fontWeight: "300",
    marginTop: -2,
  },
});
