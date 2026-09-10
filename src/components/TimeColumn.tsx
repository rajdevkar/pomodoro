import { triggerSelectionHaptic } from "@/utils/haptics";
import { pad2 } from "@/utils/timeUtils";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View, type NativeSyntheticEvent } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import type { NativeScrollEvent } from "react-native";

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
  baselineNudge,
  color,
  hapticsEnabled,
  onChange,
}: TimeColumnProps) {
  const listRef = useRef<FlatList<number>>(null);
  const lastIndexRef = useRef(value - min);
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
      listRef.current?.scrollToOffset({
        offset: index * itemHeight,
        animated,
      });
    },
    [indexForValue, itemHeight],
  );

  useEffect(() => {
    scrollToValue(value, false);
  }, [scrollToValue, value]);

  const valueFromOffset = (offsetY: number) => {
    const index = Math.round(offsetY / itemHeight);
    return data[Math.max(0, Math.min(data.length - 1, index))] ?? min;
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!enabled) return;
    const next = valueFromOffset(event.nativeEvent.contentOffset.y);
    const index = indexForValue(next);
    if (index !== lastIndexRef.current) {
      lastIndexRef.current = index;
      if (hapticsEnabled) void triggerSelectionHaptic();
    }
  };

  const commitOffset = (offsetY: number) => {
    if (!enabled) return;
    const next = valueFromOffset(offsetY);
    if (next !== value) {
      onChange(next);
    } else {
      scrollToValue(next, true);
    }
  };

  const renderItem = ({ item }: { item: number }) => (
    <View style={[styles.row, { height: itemHeight, width: columnWidth }]}>
      <Text
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
        {pad2(item)}
      </Text>
    </View>
  );

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
          <Text
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
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.column, { width: columnWidth, height: itemHeight * 3 }]}>
      <FlatList
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
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        nestedScrollEnabled
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={(event) =>
          commitOffset(event.nativeEvent.contentOffset.y)
        }
        onScrollEndDrag={(event) => {
          if (event.nativeEvent.velocity?.y === 0) {
            commitOffset(event.nativeEvent.contentOffset.y);
          }
        }}
        onLayout={() => scrollToValue(value, false)}
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
