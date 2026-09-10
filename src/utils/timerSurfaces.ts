import TimoLiveActivity from "@/widgets/TimoLiveActivity";
import TimoWidget from "@/widgets/TimoWidget";
import {
  buildTimerSurfaceProps,
  type TimerSurfaceProps,
} from "@/widgets/timerSurfaceTypes";
import {
  addUserInteractionListener,
  type LiveActivity,
} from "expo-widgets";
import { Platform } from "react-native";

export type TimerSurfaceState = {
  isActive: boolean;
  targetEndTime: number | null;
  remainingTime: number | null;
  durationMs: number;
};

type SurfaceListener = (next: {
  isActive: boolean;
  targetEndTime: number | null;
  remainingTime: number | null;
}) => void;

let liveActivity: LiveActivity<TimerSurfaceProps> | null = null;
let lastLiveActivitySecond: number | null = null;
let interactionSubscribed = false;

function safeSurfacesAvailable() {
  return Platform.OS === "ios" || Platform.OS === "android";
}

function propsFromState(state: TimerSurfaceState): TimerSurfaceProps {
  return buildTimerSurfaceProps(state);
}

function buildRunningTimeline(props: TimerSurfaceProps) {
  const now = Date.now();
  const end = props.targetEndTime;
  const entries: { date: Date; props: TimerSurfaceProps }[] = [
    { date: new Date(now), props },
  ];

  // Dense updates for the first two minutes, then every 15s to respect WidgetKit budget.
  const denseUntil = Math.min(end, now + 2 * 60 * 1000);
  for (let t = now + 1000; t < denseUntil; t += 1000) {
    const remainingMs = Math.max(0, end - t);
    entries.push({
      date: new Date(t),
      props: {
        ...props,
        remainingMs,
        startedAt: end - remainingMs,
      },
    });
  }

  for (let t = denseUntil; t < end; t += 15_000) {
    if (t <= now + 1000) continue;
    const remainingMs = Math.max(0, end - t);
    entries.push({
      date: new Date(t),
      props: {
        ...props,
        remainingMs,
        startedAt: end - remainingMs,
      },
    });
  }

  entries.push({
    date: new Date(end),
    props: {
      ...props,
      isActive: false,
      targetEndTime: 0,
      startedAt: 0,
      remainingMs: props.durationMs,
      label: "Ready",
    },
  });

  return entries;
}

async function endLiveActivity(finalProps?: TimerSurfaceProps) {
  if (!liveActivity) {
    const existing = TimoLiveActivity.getInstances()[0];
    if (existing) liveActivity = existing;
  }
  if (!liveActivity) return;

  try {
    await liveActivity.end("immediate", finalProps);
  } catch {
    // Live Activities are iOS-only; ignore when unavailable.
  } finally {
    liveActivity = null;
    lastLiveActivitySecond = null;
  }
}

function startOrUpdateLiveActivity(props: TimerSurfaceProps) {
  if (Platform.OS !== "ios") return;

  try {
    if (!liveActivity) {
      const existing = TimoLiveActivity.getInstances()[0];
      liveActivity = existing ?? TimoLiveActivity.start(props);
      lastLiveActivitySecond = Math.ceil(props.remainingMs / 1000);
      return;
    }

    const second = Math.ceil(props.remainingMs / 1000);
    if (lastLiveActivitySecond === second) return;
    lastLiveActivitySecond = second;
    void liveActivity.update(props);
  } catch {
    liveActivity = null;
  }
}

/** Push current timer state to the home widget and iOS Live Activity. */
export function syncTimerSurfaces(state: TimerSurfaceState) {
  if (!safeSurfacesAvailable()) return;

  const props = propsFromState(state);

  try {
    if (props.isActive && props.targetEndTime > 0) {
      // Native countdown Text handles second ticks; timeline still covers pause/complete snapshots.
      TimoWidget.updateSnapshot(props);
      startOrUpdateLiveActivity(props);
    } else {
      TimoWidget.updateSnapshot(props);
      void endLiveActivity(props);
    }
  } catch {
    // Development builds without the native module should not crash the timer.
  }
}

/**
 * Optional denser widget timeline when the app may leave the foreground mid-run.
 * Prefer syncTimerSurfaces for ordinary updates; call this when starting a long session.
 */
export function scheduleRunningWidgetTimeline(state: TimerSurfaceState) {
  if (!safeSurfacesAvailable()) return;
  const props = propsFromState(state);
  if (!props.isActive || props.targetEndTime <= 0) {
    TimoWidget.updateSnapshot(props);
    return;
  }
  try {
    TimoWidget.updateTimeline(buildRunningTimeline(props));
    startOrUpdateLiveActivity(props);
  } catch {
    // ignore
  }
}

/** Keep jotai timer atoms in sync when the widget Play/Pause button is used. */
export function subscribeTimerSurfaceInteractions(listener: SurfaceListener) {
  if (interactionSubscribed || !safeSurfacesAvailable()) {
    return { remove() {} };
  }

  interactionSubscribed = true;
  const subscription = addUserInteractionListener((event) => {
    if (event.source !== "TimoWidget" || event.target !== "toggle") return;

    void (async () => {
      try {
        const timeline = await TimoWidget.getTimeline();
        const latest = timeline[timeline.length - 1]?.props;
        if (!latest) return;

        listener({
          isActive: latest.isActive,
          targetEndTime: latest.targetEndTime > 0 ? latest.targetEndTime : null,
          remainingTime:
            latest.isActive || latest.label === "Ready"
              ? null
              : latest.remainingMs,
        });

        if (latest.isActive) {
          startOrUpdateLiveActivity(latest);
        } else {
          void endLiveActivity(latest);
        }
      } catch {
        // ignore
      }
    })();
  });

  return {
    remove() {
      interactionSubscribed = false;
      subscription.remove();
    },
  };
}
