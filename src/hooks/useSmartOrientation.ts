'use client';

import { useOrientation } from 'react-use';
import { useEffect, useState } from 'react';

export type PomodoroMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

export interface SmartOrientationState {
  mode: PomodoroMode;
  durationMinutes: number;
  label: string;
  isLandscape: boolean;
}

export function useSmartOrientation() {
  const { type: screenType, angle } = useOrientation();

  const [state, setState] = useState<SmartOrientationState>({
    mode: 'FOCUS',
    durationMinutes: 5,
    label: 'Portrait',
    isLandscape: false,
  });

  useEffect(() => {
    let mode: PomodoroMode = 'FOCUS';
    let duration = 5;
    let label = 'Portrait (5m)';
    let isLandscape = false;

    if (screenType.includes('landscape')) {
      isLandscape = true;
      if (screenType === 'landscape-secondary' || angle === 270 || angle === -90) {
        mode = 'LONG_BREAK';
        duration = 30;
        label = 'Landscape Left (30m)';
      } else {
        mode = 'SHORT_BREAK';
        duration = 15;
        label = 'Landscape Right (15m)';
      }
    } else {
      mode = 'FOCUS';
      duration = 5;
      label = 'Portrait (5m)';
    }

    setState({
      mode,
      durationMinutes: duration,
      label,
      isLandscape,
    });

  }, [screenType, angle]);

  return state;
}
