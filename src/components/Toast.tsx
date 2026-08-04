import { toastMessageAtom } from "@/store/atoms";
import { themeAtom } from "@/store/atoms";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";

const useNativeDriver = Platform.OS !== "web";

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
        useNativeDriver,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver,
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
    <View style={[styles.container, { pointerEvents: "none" }]}>
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
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 6,
      },
      default: {},
      web: {
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      },
    }),
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
});
