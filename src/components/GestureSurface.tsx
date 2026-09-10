import React, { useMemo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface GestureSurfaceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  enabled?: boolean;
  onTap: () => void;
  onLongPress: () => void;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onSwipeHorizontal: () => void;
}

const SWIPE_THRESHOLD = 48;

export default function GestureSurface({
  children,
  style,
  enabled = true,
  onTap,
  onLongPress,
  onSwipeUp,
  onSwipeDown,
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
      .runOnJS(true)
      .minDistance(28)
      .onEnd((event) => {
        const { translationX, translationY } = event;
        const absX = Math.abs(translationX);
        const absY = Math.abs(translationY);

        if (absY >= absX && absY >= SWIPE_THRESHOLD) {
          if (translationY < 0) {
            onSwipeUp();
          } else {
            onSwipeDown();
          }
          return;
        }

        if (absX > absY && absX >= SWIPE_THRESHOLD) {
          onSwipeHorizontal();
        }
      });

    const tap = Gesture.Tap()
      .runOnJS(true)
      .maxDuration(250)
      .onEnd((_event, success) => {
        if (success) onTap();
      });

    return Gesture.Exclusive(longPress, pan, tap);
  }, [onLongPress, onSwipeDown, onSwipeHorizontal, onSwipeUp, onTap]);

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
