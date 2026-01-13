import { useState, useEffect, useRef } from 'react';

interface GestureControlState {
  gesture: 'tilt-left' | 'tilt-right' | null;
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
  orientation: { alpha: number | null; beta: number | null; gamma: number | null };
}

export function useGestureControl(tiltThreshold: number = 45, resetThreshold: number = 20): GestureControlState {
  const [gesture, setGesture] = useState<'tilt-left' | 'tilt-right' | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [orientation, setOrientation] = useState<{ alpha: number | null; beta: number | null; gamma: number | null }>({ alpha: 0, beta: 0, gamma: 0 });

  // State Machine: 'flat' | 'tilted'
  const stateRef = useRef<'flat' | 'tilted'>('flat');

  const requestPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setPermissionGranted(true);
          console.log('DeviceOrientationEvent granted and listening');
        } else {
          console.warn('DeviceOrientationEvent permission denied');
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      // Handle devices that do not need permission (e.g., Android, older iOS)
      setPermissionGranted(true);
      console.log('No permission request needed, listening directly');
    }
  };

  useEffect(() => {
    if (!permissionGranted) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { gamma } = event; // Gamma is left-to-right tilt (-90 to 90)

      if (gamma === null) return;

      setOrientation({ alpha: event.alpha, beta: event.beta, gamma: event.gamma });

      // Logic:
      // Tilted Right (Lift Left): Gamma > Threshold (e.g., > 45)
      // Tilted Left (Lift Right): Gamma < -Threshold (e.g., < -45)
      // Flat: |Gamma| < ResetThreshold (e.g., < 20)

      if (stateRef.current === 'flat') {
        if (gamma > tiltThreshold) {
          setGesture('tilt-right'); // Increment
          stateRef.current = 'tilted';
          setTimeout(() => setGesture(null), 300); // Clear gesture signal
        } else if (gamma < -tiltThreshold) {
          setGesture('tilt-left'); // Decrement
          stateRef.current = 'tilted';
          setTimeout(() => setGesture(null), 300); // Clear gesture signal
        }
      } else if (stateRef.current === 'tilted') {
        // Must return to "flat" zone to reset
        if (Math.abs(gamma) < resetThreshold) {
          stateRef.current = 'flat';
        }
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [permissionGranted, tiltThreshold, resetThreshold]);

  return { gesture, permissionGranted, requestPermission, orientation };
}
