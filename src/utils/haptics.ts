import { Platform } from "react-native";

type HapticsModule = typeof import("expo-haptics");

let hapticsModule: HapticsModule | null | undefined;
let hapticsAllowed = true;

/** Keep in sync with the Touch feedback setting. */
export function setHapticsAllowed(enabled: boolean) {
  hapticsAllowed = enabled;
}

export function getHapticsAllowed() {
  return hapticsAllowed;
}

async function getHaptics() {
  if (!hapticsAllowed) return null;
  if (Platform.OS === "web") return null;
  if (hapticsModule !== undefined) return hapticsModule;

  try {
    hapticsModule = await import("expo-haptics");
  } catch {
    hapticsModule = null;
  }

  return hapticsModule;
}

export async function triggerSelectionHaptic() {
  try {
    const Haptics = await getHaptics();
    if (!Haptics) return;
    await Haptics.selectionAsync();
  } catch {
    // Haptics unavailable
  }
}

export async function triggerLightHaptic() {
  try {
    const Haptics = await getHaptics();
    if (!Haptics) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics unavailable
  }
}

export async function triggerMediumHaptic() {
  try {
    const Haptics = await getHaptics();
    if (!Haptics) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Haptics unavailable
  }
}

export async function triggerSuccessHaptic() {
  try {
    const Haptics = await getHaptics();
    if (!Haptics) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics unavailable
  }
}
