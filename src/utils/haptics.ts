import { Platform } from "react-native";

export async function triggerLightHaptic() {
  if (Platform.OS === "web") return;

  try {
    const Haptics = await import("expo-haptics");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics unavailable (simulator / Expo Go edge cases)
  }
}

export async function triggerMediumHaptic() {
  if (Platform.OS === "web") return;

  try {
    const Haptics = await import("expo-haptics");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Haptics unavailable
  }
}

export async function triggerSuccessHaptic() {
  if (Platform.OS === "web") return;

  try {
    const Haptics = await import("expo-haptics");
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics unavailable
  }
}
