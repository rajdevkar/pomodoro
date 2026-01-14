import { useState, useEffect, useRef } from "react";

interface GestureControlState {
  gesture: "tilt-left" | "tilt-right" | null;
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
}

interface DeviceOrientationEventStatic extends EventTarget {
  requestPermission?: () => Promise<PermissionState>;
}

interface GestureCallbacks {
  onTiltLeft?: () => void;
  onTiltRight?: () => void;
}

export function useGestureControl(
  callbacks: GestureCallbacks = {},
  tiltThreshold: number = 45,
  resetThreshold: number = 20,
): Omit<GestureControlState, "gesture"> {
  const [permissionGranted, setPermissionGranted] = useState(false);

  const stateRef = useRef<"flat" | "tilted">("flat");

  const requestPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as unknown as DeviceOrientationEventStatic)
        .requestPermission === "function"
    ) {
      try {
        const permissionState = await (
          DeviceOrientationEvent as unknown as DeviceOrientationEventStatic
        ).requestPermission!();
        if (permissionState === "granted") {
          setPermissionGranted(true);
          console.log("DeviceOrientationEvent granted and listening");
        } else {
          console.warn("DeviceOrientationEvent permission denied");
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setPermissionGranted(true);
      console.log("No permission request needed, listening directly");
    }
  };

  useEffect(() => {
    if (!permissionGranted) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { gamma } = event;

      if (gamma === null) return;

      if (stateRef.current === "flat") {
        if (gamma > tiltThreshold) {
          callbacks.onTiltRight?.();
          stateRef.current = "tilted";
        } else if (gamma < -tiltThreshold) {
          callbacks.onTiltLeft?.();
          stateRef.current = "tilted";
        }
      } else if (stateRef.current === "tilted") {
        if (Math.abs(gamma) < resetThreshold) {
          stateRef.current = "flat";
        }
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
  }, [permissionGranted, tiltThreshold, resetThreshold, callbacks]);

  return { permissionGranted, requestPermission };
}
