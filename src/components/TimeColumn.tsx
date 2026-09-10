import { triggerLightHaptic } from "@/utils/haptics";
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
  fontFamily?: string;
  fontWeight: "400" | "700";
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
  fontWeight,
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
      duration: 140,
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
        duration: 220,
        useNativeDriver: true,
      }).start();
    }, 320);
  };

  const setLiveValue = (next: number) => {
    const clamped = clamp(next);
    if (clamped !== displayValueRef.current) {
      displayValueRef.current = clamped;
      setDisplayValue(clamped);
      if (hapticsEnabled) void triggerLightHaptic();
    }
    return clamped;
  };

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetY([-6, 6])
    .failOffsetX([-28, 28])
    .runOnJS(true)
    .onBegin(() => {
      startValueRef.current = displayValueRef.current;
      showNeighbors();
    })
    .onUpdate((event) => {
      const steps = Math.round(-event.translationY / itemHeight);
      const next = setLiveValue(startValueRef.current + steps);
      const remainder = event.translationY + (next - startValueRef.current) * itemHeight;
      translateY.setValue(remainder);
    })
    .onEnd(() => {
      onChange(displayValueRef.current);
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 240,
        mass: 0.7,
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
        style={[styles.column, { height: itemHeight * (NEIGHBORS * 2 + 1) }]}
      >
        <Animated.View style={{ transform: [{ translateY }] }}>
          {items.map(({ offset, itemValue, visible }) => {
            const isCenter = offset === 0;
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
                      fontSize: isCenter ? fontSize : fontSize * 0.42,
                      fontFamily,
                      fontWeight,
                      opacity: !visible ? 0 : isCenter ? 1 : 0.32,
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
    fontVariant: ["tabular-nums"],
  },
});
