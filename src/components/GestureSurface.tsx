import React, { useMemo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface GestureSurfaceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  enabled?: boolean;
  onTap: () => void;
  onLongPress: () => void;
  onSwipeHorizontal?: () => void;
}

const SWIPE_THRESHOLD = 48;

export default function GestureSurface({
  children,
  style,
  enabled = true,
  onTap,
  onLongPress,
  onSwipeHorizontal,
}: GestureSurfaceProps) {
  const gesture = useMemo(() => {
    const longPress = Gesture.LongPress()
      .minDuration(450)
      .runOnJS(true)
      .onStart(() => {
        onLongPress();
      });

    const pan = Gesture.Pan()
      .enabled(Boolean(onSwipeHorizontal))
      .runOnJS(true)
      .activeOffsetX([-36, 36])
      .failOffsetY([-20, 20])
      .onEnd((event) => {
        if (Math.abs(event.translationX) >= SWIPE_THRESHOLD) {
          onSwipeHorizontal?.();
        }
      });

    const tap = Gesture.Tap()
      .runOnJS(true)
      .maxDuration(250)
      .onEnd((_event, success) => {
        if (success) onTap();
      });

    return Gesture.Exclusive(longPress, pan, tap);
  }, [onLongPress, onSwipeHorizontal, onTap]);

  if (!enabled) {
    return <View style={[styles.fill, style]}>{children}</View>;
  }

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.fill, style]}>{children}</View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
