import { triggerSelectionHaptic } from "@/utils/haptics";
import { pad2 } from "@/utils/timeUtils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const STRIP_RANGE = 4;

interface TimeColumnProps {
  value: number;
  min: number;
  max: number;
  enabled: boolean;
  itemHeight: number;
  columnWidth: number;
  fontSize: number;
  fontFamily: string;
  neighborStride: number;
  baselineNudge: number;
  color: string;
  hapticsEnabled: boolean;
  onChange: (value: number) => void;
}

export default function TimeColumn({
  value,
  min,
  max,
  enabled,
  itemHeight,
  columnWidth,
  fontSize,
  fontFamily,
  neighborStride,
  baselineNudge,
  color,
  hapticsEnabled,
  onChange,
}: TimeColumnProps) {
  const slotHeight = neighborStride;
  const translateY = useRef(new Animated.Value(0)).current;
  const startValueRef = useRef(value);
  const baseValueRef = useRef(value);
  const [baseValue, setBaseValue] = useState(value);

  useEffect(() => {
    startValueRef.current = value;
    baseValueRef.current = value;
    setBaseValue(value);
    translateY.setValue(0);
  }, [translateY, value]);

  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  const clampOffset = (offset: number, origin: number) => {
    const maxDrag = (origin - min) * slotHeight;
    const minDrag = (origin - max) * slotHeight;
    return Math.min(maxDrag, Math.max(minDrag, offset));
  };

  const nearestStep = (offset: number) => Math.round(-offset / slotHeight);

  const moveStrip = (translationY: number) => {
    const origin = startValueRef.current;
    const offset = clampOffset(translationY, origin);
    const nextBase = clamp(origin + nearestStep(offset));
    const remainder = offset + (nextBase - origin) * slotHeight;
    translateY.setValue(remainder);

    if (nextBase !== baseValueRef.current) {
      baseValueRef.current = nextBase;
      setBaseValue(nextBase);
      if (hapticsEnabled) void triggerSelectionHaptic();
    }
  };

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetY([-4, 4])
    .failOffsetX([-36, 36])
    .runOnJS(true)
    .onBegin(() => {
      startValueRef.current = baseValueRef.current;
    })
    .onUpdate((event) => {
      moveStrip(event.translationY);
    })
    .onEnd((event) => {
      const origin = startValueRef.current;
      const projected = clampOffset(
        event.translationY + event.velocityY * 0.16,
        origin,
      );
      const next = clamp(origin + nearestStep(projected));
      const remainder =
        clampOffset(event.translationY, origin) + (next - origin) * slotHeight;

      baseValueRef.current = next;
      setBaseValue(next);
      translateY.setValue(remainder);

      Animated.spring(translateY, {
        toValue: 0,
        damping: 22,
        stiffness: 280,
        mass: 0.7,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        startValueRef.current = next;
        onChange(next);
      });
    });

  const items = useMemo(() => {
    const offsets = enabled
      ? Array.from({ length: STRIP_RANGE * 2 + 1 }, (_, index) => index - STRIP_RANGE)
      : [0];

    return offsets
      .map((offset) => ({ offset, itemValue: baseValue + offset }))
      .filter(({ itemValue }) => itemValue >= min && itemValue <= max);
  }, [baseValue, enabled, max, min]);

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[
          styles.column,
          {
            minWidth: Math.max(48, Math.round(columnWidth * 0.55)),
            height: itemHeight,
          },
        ]}
      >
        {items.map(({ offset, itemValue }) => {
          const centerAt = -offset * slotHeight;
          return (
            <Animated.Text
              key={itemValue}
              numberOfLines={1}
              pointerEvents="none"
              style={[
                styles.digit,
                {
                  color,
                  fontSize,
                  fontFamily,
                  height: slotHeight,
                  top: (itemHeight - slotHeight) / 2,
                  opacity: enabled
                    ? translateY.interpolate({
                        inputRange: [
                          centerAt - slotHeight,
                          centerAt,
                          centerAt + slotHeight,
                        ],
                        outputRange: [0.22, 1, 0.22],
                        extrapolate: "clamp",
                      })
                    : 1,
                  transform: [
                    {
                      translateY: Animated.add(
                        translateY,
                        offset * slotHeight + baselineNudge,
                      ),
                    },
                    {
                      scale: enabled
                        ? translateY.interpolate({
                            inputRange: [
                              centerAt - slotHeight,
                              centerAt,
                              centerAt + slotHeight,
                            ],
                            outputRange: [0.34, 1, 0.34],
                            extrapolate: "clamp",
                          })
                        : 1,
                    },
                  ],
                },
              ]}
            >
              {pad2(itemValue)}
            </Animated.Text>
          );
        })}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  column: {
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  digit: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
