export const fontNames = [
  "Space Grotesk",
  "Outfit",
  "Fascinate",
  "Sixtyfour",
  "Orbitron",
];

/** Registered expo-font family names, aligned with fontNames */
export const fontFamilies = [
  "SpaceGrotesk_700Bold",
  "Outfit_700Bold",
  "Fascinate_400Regular",
  "Sixtyfour_400Regular",
  "Orbitron_700Bold",
];

export const stepOptions = [1, 5, 10, 15];

export const endSoundOptions = [
  { id: "off", label: "Off" },
  { id: "melody", label: "Melody" },
  { id: "chime", label: "Chime" },
  { id: "bell", label: "Bell" },
  { id: "beep", label: "Beep" },
] as const;

export const tickSoundOptions = [
  { id: "off", label: "Off" },
  { id: "soft", label: "Soft" },
  { id: "click", label: "Click" },
  { id: "wood", label: "Wood" },
] as const;
