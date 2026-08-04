import { toastMessageAtom } from "@/store/atoms";
import { themeAtom } from "@/store/atoms";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export default function Toast() {
  const [message, setMessage] = useAtom(toastMessageAtom);
  const theme = useAtomValue(themeAtom);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (!message) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMessage(null);
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, opacity, setMessage, translateY]);

  if (!message) return null;

  const isDark = theme === "dark";

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.View
        style={[
          styles.toast,
          {
            opacity,
            transform: [{ translateY }],
            backgroundColor: isDark
              ? "rgba(255,255,255,0.9)"
              : "rgba(0,0,0,0.8)",
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: isDark ? "#000000" : "#ffffff" },
          ]}
        >
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: "center",
  },
  toast: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
});
