export const fontNames = ["Space Grotesk", "Outfit"];

/** Registered expo-font family names, aligned with fontNames */
export const fontFamilies = ["SpaceGrotesk_700Bold", "Outfit_700Bold"];

/** Per-font digit box. baselineNudge is a fraction of fontSize, positive shifts down. */
export const fontMetrics = [
  { digitWidth: 1.34, rowHeight: 1.2, sizeScale: 1, colonWidth: 0.42, baselineNudge: 0 },
  { digitWidth: 1.34, rowHeight: 1.2, sizeScale: 1, colonWidth: 0.42, baselineNudge: 0 },
] as const;

export function resolveFontIndex(fontIndex: number) {
  if (fontIndex < 0 || fontIndex >= fontFamilies.length) return 0;
  return fontIndex;
}

export function timerLayout(
  fontIndex: number,
  viewportWidth: number,
  viewportHeight: number,
  fontSizePercent: number,
) {
  const metrics = fontMetrics[resolveFontIndex(fontIndex)] ?? fontMetrics[0];
  const base = Math.min(
    Math.max((fontSizePercent / 100) * viewportHeight * 0.2, 40),
    viewportWidth * 0.24,
  );
  let fontSize = base * metrics.sizeScale;
  let itemHeight = Math.round(fontSize * metrics.rowHeight);
  let columnWidth = Math.round(fontSize * metrics.digitWidth);
  let colonWidth = Math.round(fontSize * metrics.colonWidth);
  const maxWidth = viewportWidth * 0.82;
  const rawWidth = columnWidth * 2 + colonWidth + 40;

  if (rawWidth > maxWidth) {
    const scale = maxWidth / rawWidth;
    fontSize *= scale;
    itemHeight = Math.round(itemHeight * scale);
    columnWidth = Math.round(columnWidth * scale);
    colonWidth = Math.round(colonWidth * scale);
  }

  const neighborStride = Math.round(Math.max(fontSize * 0.76, itemHeight * 0.64));

  return {
    fontSize,
    itemHeight,
    columnWidth,
    colonWidth,
    timeWidth: columnWidth * 2 + colonWidth,
    neighborStride,
    baselineNudge: Math.round(fontSize * metrics.baselineNudge),
  };
}

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
