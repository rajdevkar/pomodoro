import { triggerSelectionHaptic } from "@/utils/haptics";
import { pad2 } from "@/utils/timeUtils";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const NEIGHBORS = 2;

interface TimeColumnProps {
  value: number;
  min: number;
  max: number;
  enabled: boolean;
  itemHeight: number;
  fontSize: number;
  fontFamily: string;
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
  fontSize,
  fontFamily,
  color,
  hapticsEnabled,
  onChange,
}: TimeColumnProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const translateY = useRef(new Animated.Value(0)).current;
  const neighborOpacity = useRef(new Animated.Value(0)).current;
  const startValueRef = useRef(value);
  const displayValueRef = useRef(value);
  const hideNeighborsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayValue(value);
    displayValueRef.current = value;
    translateY.setValue(0);
  }, [translateY, value]);

  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  const showNeighbors = () => {
    if (hideNeighborsTimer.current) {
      clearTimeout(hideNeighborsTimer.current);
      hideNeighborsTimer.current = null;
    }
    Animated.timing(neighborOpacity, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const hideNeighborsSoon = () => {
    if (hideNeighborsTimer.current) {
      clearTimeout(hideNeighborsTimer.current);
    }
    hideNeighborsTimer.current = setTimeout(() => {
      Animated.timing(neighborOpacity, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }, 420);
  };

  const setLiveValue = (next: number) => {
    const clamped = clamp(next);
    if (clamped !== displayValueRef.current) {
      displayValueRef.current = clamped;
      setDisplayValue(clamped);
      if (hapticsEnabled) void triggerSelectionHaptic();
    }
    return clamped;
  };

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetY([-4, 4])
    .failOffsetX([-36, 36])
    .runOnJS(true)
    .onBegin(() => {
      startValueRef.current = displayValueRef.current;
      showNeighbors();
    })
    .onUpdate((event) => {
      const steps = Math.round(-event.translationY / itemHeight);
      const next = setLiveValue(startValueRef.current + steps);
      const remainder =
        event.translationY + (next - startValueRef.current) * itemHeight;
      translateY.setValue(remainder);
    })
    .onEnd((event) => {
      const flick = Math.round(-event.velocityY / 1600);
      if (flick !== 0) {
        setLiveValue(displayValueRef.current + flick);
      }
      onChange(displayValueRef.current);
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 260,
        mass: 0.65,
        useNativeDriver: true,
      }).start();
      hideNeighborsSoon();
    });

  const items = [];
  for (let offset = -NEIGHBORS; offset <= NEIGHBORS; offset += 1) {
    const itemValue = displayValue + offset;
    items.push({
      offset,
      itemValue,
      visible: itemValue >= min && itemValue <= max,
    });
  }

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[
          styles.column,
          {
            height: itemHeight * (NEIGHBORS * 2 + 1),
            minWidth: fontSize * 1.35,
          },
        ]}
      >
        <Animated.View style={{ transform: [{ translateY }] }}>
          {items.map(({ offset, itemValue, visible }) => {
            const isCenter = offset === 0;
            const distance = Math.abs(offset);
            return (
              <Animated.View
                key={`${offset}`}
                style={[
                  styles.item,
                  { height: itemHeight },
                  !isCenter && { opacity: neighborOpacity },
                ]}
              >
                <Text
                  style={[
                    styles.text,
                    {
                      color,
                      fontSize: isCenter
                        ? fontSize
                        : fontSize * (distance === 1 ? 0.38 : 0.28),
                      fontFamily,
                      opacity: !visible
                        ? 0
                        : isCenter
                          ? 1
                          : distance === 1
                            ? 0.38
                            : 0.18,
                    },
                  ]}
                >
                  {visible ? pad2(itemValue) : " "}
                </Text>
              </Animated.View>
            );
          })}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  column: {
    overflow: "hidden",
    justifyContent: "center",
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    letterSpacing: -2,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
