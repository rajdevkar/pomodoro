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
import { BlurView } from "expo-blur";
import { useAtom } from "jotai";
import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChevronBackIcon from "./icons/ChevronBackIcon";

interface SettingsScreenProps {
  onBack: () => void;
}

function GlassGroup({
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
          borderColor: isDark
            ? "rgba(255,255,255,0.12)"
            : "rgba(255,255,255,0.55)",
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOpacity: isDark ? 0.35 : 0.08,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 },
            },
            android: { elevation: 3 },
            default: {},
          }),
        },
      ]}
    >
      <BlurView
        intensity={Platform.OS === "ios" ? 55 : 80}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark
              ? "rgba(44,44,46,0.55)"
              : "rgba(255,255,255,0.55)",
          },
        ]}
      />
      <View style={styles.groupContent}>{children}</View>
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

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
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
  const accent = "#0A84FF";
  const labelColor = isDark ? "#ffffff" : "#000000";
  const secondaryColor = isDark
    ? "rgba(235,235,245,0.6)"
    : "rgba(60,60,67,0.6)";

  const withHaptic = (action: () => void) => {
    if (hapticsEnabled) void triggerLightHaptic();
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
                backgroundColor: isDark
                  ? "rgba(99,99,102,0.92)"
                  : "rgba(255,255,255,0.92)",
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOpacity: 0.12,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 1 },
                  },
                  default: {},
                }),
              },
            ]}
          >
            <Text
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
    <View
      style={[
        styles.root,
        { backgroundColor: isDark ? "#000000" : "#F2F2F7" },
      ]}
    >
      {/* Soft atmospheric blobs so glass has something to catch */}
      <View
        style={[
          styles.blob,
          styles.blobTop,
          {
            backgroundColor: isDark
              ? "rgba(10,132,255,0.22)"
              : "rgba(10,132,255,0.18)",
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          styles.blobBottom,
          {
            backgroundColor: isDark
              ? "rgba(191,90,242,0.16)"
              : "rgba(255,55,95,0.12)",
          },
        ]}
      />

      <BlurView
        intensity={Platform.OS === "ios" ? 40 : 60}
        tint={isDark ? "dark" : "light"}
        style={[
          styles.navBar,
          {
            paddingTop: insets.top + 4,
            borderBottomColor: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.06)",
          },
        ]}
      >
        <View style={styles.navRow}>
          <Pressable
            onPress={() => withHaptic(onBack)}
            accessibilityLabel="Back to timer"
            hitSlop={12}
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.55 : 1 },
            ]}
          >
            <ChevronBackIcon color={accent} size={24} />
            <Text style={[styles.backLabel, { color: accent }]}>Timo</Text>
          </Pressable>
          <Text style={[styles.navTitle, { color: labelColor }]}>Settings</Text>
          <View style={styles.navSpacer} />
        </View>
      </BlurView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(32, insets.bottom + 24) },
        ]}
      >
        <GroupHeader title="Timer" isDark={isDark} />
        <GlassGroup isDark={isDark}>
          <View style={styles.rowBlock}>
            <Text style={[styles.rowLabel, { color: labelColor }]}>Step</Text>
            {renderSegment(
              stepOptions.map((step) => ({
                id: String(step),
                label: `${step} min`,
              })),
              String(stepMinutes),
              (id) => withHaptic(() => setStepMinutes(Number(id))),
            )}
          </View>
          <RowDivider isDark={isDark} />
          <View style={styles.rowBlock}>
            <View style={styles.rowBetween}>
              <Text style={[styles.rowLabel, { color: labelColor }]}>
                Duration
              </Text>
              <Text style={[styles.rowValue, { color: secondaryColor }]}>
                {durationMinutes} min
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
              minimumTrackTintColor={accent}
              maximumTrackTintColor={
                isDark ? "rgba(120,120,128,0.36)" : "rgba(120,120,128,0.2)"
              }
              thumbTintColor={isDark ? "#ffffff" : "#ffffff"}
            />
          </View>
        </GlassGroup>

        <GroupHeader title="Feedback & Sound" isDark={isDark} />
        <GlassGroup isDark={isDark}>
          <View style={styles.rowBlock}>
            <Text style={[styles.rowLabel, { color: labelColor }]}>
              Touch feedback
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
          <RowDivider isDark={isDark} />
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
        </GlassGroup>

        <GroupHeader title="Appearance" isDark={isDark} />
        <GlassGroup isDark={isDark}>
          <View style={styles.rowBlock}>
            <Text style={[styles.rowLabel, { color: labelColor }]}>Font</Text>
            <View style={styles.fontGrid}>
              {fontNames.map((name, i) => {
                const selected = fontIndex === i;
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
                          color: selected
                            ? "#ffffff"
                            : labelColor,
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
              <Text style={[styles.rowLabel, { color: labelColor }]}>Size</Text>
              <Text style={[styles.rowValue, { color: secondaryColor }]}>
                {fontSizePercent}%
              </Text>
            </View>
            <Slider
              minimumValue={20}
              maximumValue={100}
              step={1}
              value={fontSizePercent}
              onValueChange={(value) => setFontSizePercent(Math.round(value))}
              onSlidingComplete={() => {
                if (hapticsEnabled) void triggerLightHaptic();
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
            <Text style={[styles.rowLabel, { color: labelColor }]}>Theme</Text>
            {renderSegment(
              [
                { id: "light", label: "Light" },
                { id: "dark", label: "Dark" },
              ] as const,
              theme,
              (id) => withHaptic(() => setTheme(id)),
            )}
          </View>
        </GlassGroup>

        <GroupHeader title="How to use" isDark={isDark} />
        <GlassGroup isDark={isDark}>
          <View style={styles.rowBlock}>
            {(
              [
                ["Tap", "Play or pause"],
                ["Swipe up / down", "Change duration"],
                ["Hold", "Reset"],
                ["Swipe sideways", "Open settings"],
              ] as const
            ).map(([gesture, action], index, list) => (
              <React.Fragment key={gesture}>
                <View style={styles.helpRow}>
                  <Text style={[styles.helpGesture, { color: labelColor }]}>
                    {gesture}
                  </Text>
                  <Text style={[styles.helpAction, { color: secondaryColor }]}>
                    {action}
                  </Text>
                </View>
                {index < list.length - 1 ? (
                  <RowDivider isDark={isDark} inset={0} />
                ) : null}
              </React.Fragment>
            ))}
          </View>
        </GlassGroup>

        <GroupHeader title="Support" isDark={isDark} />
        <GlassGroup isDark={isDark}>
          <Pressable
            onPress={() => {
              if (hapticsEnabled) void triggerLightHaptic();
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
            <Text style={[styles.chevron, { color: secondaryColor }]}>›</Text>
          </Pressable>
        </GlassGroup>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
  },
  blob: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 999,
    opacity: 0.9,
  },
  blobTop: {
    top: -40,
    right: -60,
  },
  blobBottom: {
    bottom: 80,
    left: -80,
  },
  navBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    zIndex: 2,
  },
  navRow: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 88,
    paddingLeft: 2,
  },
  backLabel: {
    fontSize: 17,
    fontWeight: "400",
    marginLeft: -2,
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },
  navSpacer: {
    minWidth: 88,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  groupHeader: {
    fontSize: 13,
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 18,
    marginBottom: 6,
    marginLeft: 16,
  },
  groupShell: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  groupContent: {
    zIndex: 1,
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
    flexBasis: "18%",
    minWidth: 56,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentText: {
    fontSize: 13,
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
