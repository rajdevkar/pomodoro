/** Registered expo-font family used for the timer digits. */
export const timerFontFamily = "SpaceGrotesk_700Bold";

const FONT_METRICS = {
  digitWidth: 1.34,
  rowHeight: 1.2,
  sizeScale: 1,
  /** Gap between minute and second columns; colon dots are centered in this. */
  colonWidth: 0.5,
  baselineNudge: 0,
} as const;

/** Fixed size relative to viewport (replaces the old size slider default). */
const FONT_SIZE_PERCENT = 50;

export function timerLayout(viewportWidth: number, viewportHeight: number) {
  const base = Math.min(
    Math.max((FONT_SIZE_PERCENT / 100) * viewportHeight * 0.2, 40),
    viewportWidth * 0.24,
  );
  let fontSize = base * FONT_METRICS.sizeScale;
  let itemHeight = Math.round(fontSize * FONT_METRICS.rowHeight);
  let columnWidth = Math.round(fontSize * FONT_METRICS.digitWidth);
  let colonWidth = Math.round(fontSize * FONT_METRICS.colonWidth);
  const maxWidth = viewportWidth * 0.82;
  const rawWidth = columnWidth * 2 + colonWidth + 40;

  if (rawWidth > maxWidth) {
    const scale = maxWidth / rawWidth;
    fontSize *= scale;
    itemHeight = Math.round(itemHeight * scale);
    columnWidth = Math.round(columnWidth * scale);
    colonWidth = Math.round(colonWidth * scale);
  }

  const neighborStride = Math.round(
    Math.max(fontSize * 0.76, itemHeight * 0.64),
  );

  return {
    fontSize,
    itemHeight,
    columnWidth,
    colonWidth,
    timeWidth: columnWidth * 2 + colonWidth,
    neighborStride,
    baselineNudge: Math.round(fontSize * FONT_METRICS.baselineNudge),
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
