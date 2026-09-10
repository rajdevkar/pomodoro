import { triggerSelectionHaptic } from "@/utils/haptics";
import { pad2 } from "@/utils/timeUtils";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList as unknown as typeof FlatList<number>,
);

interface TimeColumnProps {
  value: number;
  min: number;
  max: number;
  enabled: boolean;
  itemHeight: number;
  columnWidth: number;
  fontSize: number;
  fontFamily: string;
  baselineNudge: number;
  color: string;
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
  baselineNudge,
  color,
  onChange,
}: TimeColumnProps) {
  const listRef = useRef<FlatList<number>>(null);
  const lastIndexRef = useRef(value - min);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settlingRef = useRef(false);
  const scrollY = useRef(new Animated.Value((value - min) * itemHeight)).current;
  const neighborFade = useRef(new Animated.Value(0)).current;

  const data = useMemo(() => {
    const items: number[] = [];
    for (let item = min; item <= max; item += 1) {
      items.push(item);
    }
    return items;
  }, [max, min]);

  const indexForValue = useCallback(
    (next: number) => Math.max(0, Math.min(data.length - 1, next - min)),
    [data.length, min],
  );

  const scrollToValue = useCallback(
    (next: number, animated: boolean) => {
      const index = indexForValue(next);
      lastIndexRef.current = index;
      const offset = index * itemHeight;
      if (!animated) {
        scrollY.setValue(offset);
      }
      listRef.current?.scrollToOffset({
        offset,
        animated,
      });
    },
    [indexForValue, itemHeight, scrollY],
  );

  useEffect(() => {
    const index = indexForValue(value);
    if (lastIndexRef.current === index) return;
    scrollToValue(value, false);
  }, [indexForValue, scrollToValue, value]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const valueFromOffset = (offsetY: number) => {
    const index = Math.round(offsetY / itemHeight);
    return data[Math.max(0, Math.min(data.length - 1, index))] ?? min;
  };

  const revealNeighbors = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    settlingRef.current = false;
    Animated.timing(neighborFade, {
      toValue: 1,
      duration: 90,
      useNativeDriver: true,
    }).start();
  };

  const hideNeighborsSoon = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      Animated.timing(neighborFade, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
      hideTimerRef.current = null;
    }, 320);
  };

  const onScrollTick = (offsetY: number) => {
    if (!enabled) return;
    const next = valueFromOffset(offsetY);
    const index = indexForValue(next);
    if (index !== lastIndexRef.current) {
      lastIndexRef.current = index;
      void triggerSelectionHaptic();
    }
  };

  const commitOffset = (offsetY: number) => {
    if (!enabled || settlingRef.current) return;

    const next = valueFromOffset(offsetY);
    const target = indexForValue(next) * itemHeight;
    const delta = Math.abs(offsetY - target);
    lastIndexRef.current = indexForValue(next);
    settlingRef.current = true;
    hideNeighborsSoon();

    // Only ease into place when we're meaningfully off-center.
    if (delta > 1.5) {
      listRef.current?.scrollToOffset({
        offset: target,
        animated: true,
      });
    }

    if (next !== value) {
      onChange(next);
    }

    setTimeout(() => {
      settlingRef.current = false;
    }, 280);
  };

  const renderItem = ({ item, index }: { item: number; index: number }) => {
    const center = index * itemHeight;
    // Wider ranges = softer size / opacity changes while spinning.
    const inputRange = [
      center - itemHeight * 1.35,
      center - itemHeight * 0.55,
      center,
      center + itemHeight * 0.55,
      center + itemHeight * 1.35,
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.58, 0.82, 1, 0.82, 0.58],
      extrapolate: "clamp",
    });

    const scrollOpacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.18, 0.42, 1, 0.42, 0.18],
      extrapolate: "clamp",
    });

    const centerWeight = scrollY.interpolate({
      inputRange: [
        center - itemHeight * 0.55,
        center,
        center + itemHeight * 0.55,
      ],
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });

    const neighborWeight = Animated.subtract(scrollOpacity, centerWeight);
    const opacity = Animated.add(
      centerWeight,
      Animated.multiply(neighborFade, neighborWeight),
    );

    return (
      <View style={[styles.row, { height: itemHeight, width: columnWidth }]}>
        <Animated.Text
          numberOfLines={1}
          style={[
            styles.digit,
            {
              color,
              fontSize,
              fontFamily,
              lineHeight: itemHeight,
              opacity,
              transform: [{ translateY: baselineNudge }, { scale }],
            },
          ]}
        >
          {pad2(item)}
        </Animated.Text>
      </View>
    );
  };

  if (!enabled) {
    return (
      <View
        style={[
          styles.column,
          styles.centered,
          { width: columnWidth, height: itemHeight * 3 },
        ]}
      >
        <View style={[styles.row, { height: itemHeight, width: columnWidth }]}>
          <Animated.Text
            numberOfLines={1}
            style={[
              styles.digit,
              {
                color,
                fontSize,
                fontFamily,
                lineHeight: itemHeight,
                transform: [{ translateY: baselineNudge }],
              },
            ]}
          >
            {pad2(value)}
          </Animated.Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.column, { width: columnWidth, height: itemHeight * 3 }]}>
      <AnimatedFlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => String(item)}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        scrollEnabled={enabled}
        showsVerticalScrollIndicator={false}
        bounces
        alwaysBounceVertical
        overScrollMode="never"
        decelerationRate={Platform.OS === "ios" ? 0.998 : 0.985}
        nestedScrollEnabled
        scrollEventThrottle={1}
        onScrollBeginDrag={revealNeighbors}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
              onScrollTick(event.nativeEvent.contentOffset.y);
            },
          },
        )}
        onMomentumScrollEnd={(event) =>
          commitOffset(event.nativeEvent.contentOffset.y)
        }
        onScrollEndDrag={(event) => {
          const velocityY = event.nativeEvent.velocity?.y ?? 0;
          // Small leftover motion: settle now. Strong flick: let it coast.
          if (Math.abs(velocityY) < 0.12) {
            commitOffset(event.nativeEvent.contentOffset.y);
          }
        }}
        onLayout={() => {
          const index = indexForValue(value);
          lastIndexRef.current = index;
          scrollY.setValue(index * itemHeight);
          listRef.current?.scrollToOffset({
            offset: index * itemHeight,
            animated: false,
          });
        }}
        contentContainerStyle={{ paddingVertical: itemHeight }}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    overflow: "hidden",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flexGrow: 0,
    height: "100%",
  },
  row: {
    alignItems: "center",
    justifyContent: "center",
  },
  digit: {
    width: "100%",
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
