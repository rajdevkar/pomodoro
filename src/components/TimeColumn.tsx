import { triggerSelectionHaptic } from "@/utils/haptics";
import { pad2 } from "@/utils/timeUtils";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface TimeColumnProps {
  value: number;
  min: number;
  max: number;
  enabled: boolean;
  itemHeight: number;
  columnWidth: number;
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
  columnWidth,
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
  const neighborStep = Math.round(fontSize * 0.52);

  useEffect(() => {
    setDisplayValue(value);
    displayValueRef.current = value;
    translateY.setValue(0);
  }, [translateY, value]);

  useEffect(() => {
    if (!enabled) {
      if (hideNeighborsTimer.current) {
        clearTimeout(hideNeighborsTimer.current);
      }
      neighborOpacity.setValue(0);
    }
  }, [enabled, neighborOpacity]);

  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  const showNeighbors = () => {
    if (hideNeighborsTimer.current) {
      clearTimeout(hideNeighborsTimer.current);
      hideNeighborsTimer.current = null;
    }
    Animated.timing(neighborOpacity, {
      toValue: 1,
      duration: 100,
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
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, 280);
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
      const steps = Math.round(-event.translationY / neighborStep);
      const next = setLiveValue(startValueRef.current + steps);
      const remainder =
        event.translationY + (next - startValueRef.current) * neighborStep;
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

  const neighbors = [-2, -1, 1, 2].map((offset) => {
    const itemValue = displayValue + offset;
    return {
      offset,
      itemValue,
      visible: itemValue >= min && itemValue <= max,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.column, { width: columnWidth, height: itemHeight }]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.neighbors, { opacity: neighborOpacity }]}
        >
          {neighbors.map(({ offset, itemValue, visible }) => (
            <Text
              key={offset}
              style={[
                styles.neighbor,
                {
                  top: itemHeight / 2 + offset * neighborStep - fontSize * 0.22,
                  width: columnWidth,
                  color,
                  fontSize: fontSize * (Math.abs(offset) === 1 ? 0.36 : 0.26),
                  fontFamily,
                  opacity: visible ? (Math.abs(offset) === 1 ? 0.4 : 0.2) : 0,
                },
              ]}
            >
              {visible ? pad2(itemValue) : " "}
            </Text>
          ))}
        </Animated.View>

        <Animated.View
          style={[
            styles.center,
            { height: itemHeight, transform: [{ translateY }] },
          ]}
        >
          <Text
            style={[
              styles.centerText,
              {
                color,
                fontSize,
                fontFamily,
                lineHeight: itemHeight,
              },
            ]}
          >
            {pad2(displayValue)}
          </Text>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  column: {
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
  },
  neighbors: {
    ...StyleSheet.absoluteFill,
  },
  neighbor: {
    position: "absolute",
    textAlign: "center",
    letterSpacing: -1,
    includeFontPadding: false,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  centerText: {
    textAlign: "center",
    letterSpacing: -2,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
