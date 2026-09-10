import { requireOptionalNativeModule } from "expo";
import { Platform } from "react-native";
import {
  buildTimerSurfaceProps,
  type TimerSurfaceProps,
} from "@/widgets/timerSurfaceTypes";

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

type WidgetApi = {
  updateSnapshot: (props: TimerSurfaceProps) => void;
  updateTimeline: (
    entries: { date: Date; props: TimerSurfaceProps }[],
  ) => void;
  getTimeline: () => Promise<{ date: Date; props: TimerSurfaceProps }[]>;
};

type LiveActivityApi = {
  start: (props: TimerSurfaceProps) => {
    update: (props: TimerSurfaceProps) => Promise<void>;
    end: (
      policy?: "immediate" | "default",
      props?: TimerSurfaceProps,
    ) => Promise<void>;
  };
  getInstances: () => Array<{
    update: (props: TimerSurfaceProps) => Promise<void>;
    end: (
      policy?: "immediate" | "default",
      props?: TimerSurfaceProps,
    ) => Promise<void>;
  }>;
};

type WidgetsModule = {
  addUserInteractionListener: (
    listener: (event: {
      source: string;
      target: string;
      timestamp: number;
    }) => void,
  ) => { remove: () => void };
};

type SurfaceModules = {
  TimoWidget: WidgetApi;
  TimoLiveActivity: LiveActivityApi;
  addUserInteractionListener: WidgetsModule["addUserInteractionListener"];
};

let modulesPromise: Promise<SurfaceModules | null> | null = null;
let liveActivity: ReturnType<LiveActivityApi["start"]> | null = null;
let lastLiveActivitySecond: number | null = null;
let interactionSubscribed = false;

function hasNativeWidgets() {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return false;
  // Expo Go and web stubs do not ship ExpoWidgets — skip before importing.
  return requireOptionalNativeModule("ExpoWidgets") != null;
}

async function loadSurfaceModules(): Promise<SurfaceModules | null> {
  if (!hasNativeWidgets()) return null;
  if (!modulesPromise) {
    modulesPromise = (async () => {
      try {
        const [
          { default: TimoWidget },
          { default: TimoLiveActivity },
          { addUserInteractionListener },
        ] = await Promise.all([
          import("@/widgets/TimoWidget"),
          import("@/widgets/TimoLiveActivity"),
          import("expo-widgets"),
        ]);
        return {
          TimoWidget,
          TimoLiveActivity,
          addUserInteractionListener,
        };
      } catch {
        return null;
      }
    })();
  }
  return modulesPromise;
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

async function endLiveActivity(
  modules: SurfaceModules,
  finalProps?: TimerSurfaceProps,
) {
  if (!liveActivity) {
    const existing = modules.TimoLiveActivity.getInstances()[0];
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

function startOrUpdateLiveActivity(
  modules: SurfaceModules,
  props: TimerSurfaceProps,
) {
  if (Platform.OS !== "ios") return;

  try {
    if (!liveActivity) {
      const existing = modules.TimoLiveActivity.getInstances()[0];
      liveActivity = existing ?? modules.TimoLiveActivity.start(props);
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
  if (!hasNativeWidgets()) return;

  const props = propsFromState(state);
  void loadSurfaceModules().then((modules) => {
    if (!modules) return;
    try {
      if (props.isActive && props.targetEndTime > 0) {
        modules.TimoWidget.updateSnapshot(props);
        startOrUpdateLiveActivity(modules, props);
      } else {
        modules.TimoWidget.updateSnapshot(props);
        void endLiveActivity(modules, props);
      }
    } catch {
      // Keep the timer usable if the native surface fails.
    }
  });
}

/**
 * Optional denser widget timeline when starting a long session.
 */
export function scheduleRunningWidgetTimeline(state: TimerSurfaceState) {
  if (!hasNativeWidgets()) return;

  const props = propsFromState(state);
  void loadSurfaceModules().then((modules) => {
    if (!modules) return;
    try {
      if (!props.isActive || props.targetEndTime <= 0) {
        modules.TimoWidget.updateSnapshot(props);
        return;
      }
      modules.TimoWidget.updateTimeline(buildRunningTimeline(props));
      startOrUpdateLiveActivity(modules, props);
    } catch {
      // ignore
    }
  });
}

/** Keep jotai timer atoms in sync when the widget Play/Pause button is used. */
export function subscribeTimerSurfaceInteractions(listener: SurfaceListener) {
  if (interactionSubscribed || !hasNativeWidgets()) {
    return { remove() {} };
  }

  interactionSubscribed = true;
  let subscription: { remove: () => void } | null = null;

  void loadSurfaceModules().then((modules) => {
    if (!modules || !interactionSubscribed) return;

    subscription = modules.addUserInteractionListener((event) => {
      if (event.source !== "TimoWidget" || event.target !== "toggle") return;

      void (async () => {
        try {
          const timeline = await modules.TimoWidget.getTimeline();
          const latest = timeline[timeline.length - 1]?.props;
          if (!latest) return;

          listener({
            isActive: latest.isActive,
            targetEndTime:
              latest.targetEndTime > 0 ? latest.targetEndTime : null,
            remainingTime:
              latest.isActive || latest.label === "Ready"
                ? null
                : latest.remainingMs,
          });

          if (latest.isActive) {
            startOrUpdateLiveActivity(modules, latest);
          } else {
            void endLiveActivity(modules, latest);
          }
        } catch {
          // ignore
        }
      })();
    });
  });

  return {
    remove() {
      interactionSubscribed = false;
      subscription?.remove();
    },
  };
}
