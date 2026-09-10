export type TimerSurfaceLabel = "Focus" | "Paused" | "Ready";

/** JSON-safe props shared by the home widget and Live Activity. */
export type TimerSurfaceProps = {
  isActive: boolean;
  /** Epoch ms when the current run ends; 0 when not running. */
  targetEndTime: number;
  /** Epoch ms when the current run started; used for native countdown Text. */
  startedAt: number;
  /** Remaining ms when paused/ready (ignored while active countdown Text is used). */
  remainingMs: number;
  durationMs: number;
  label: TimerSurfaceLabel;
};

export function buildTimerSurfaceProps(input: {
  isActive: boolean;
  targetEndTime: number | null;
  remainingTime: number | null;
  durationMs: number;
  now?: number;
}): TimerSurfaceProps {
  const now = input.now ?? Date.now();
  const durationMs = input.durationMs;

  if (input.isActive && input.targetEndTime) {
    const remainingMs = Math.max(0, input.targetEndTime - now);
    return {
      isActive: true,
      targetEndTime: input.targetEndTime,
      startedAt: input.targetEndTime - remainingMs,
      remainingMs,
      durationMs,
      label: "Focus",
    };
  }

  if (input.remainingTime !== null) {
    return {
      isActive: false,
      targetEndTime: 0,
      startedAt: 0,
      remainingMs: Math.max(0, input.remainingTime),
      durationMs,
      label: "Paused",
    };
  }

  return {
    isActive: false,
    targetEndTime: 0,
    startedAt: 0,
    remainingMs: durationMs,
    durationMs,
    label: "Ready",
  };
}
