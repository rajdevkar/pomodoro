'use client';

import { useEffect, useState, useRef } from 'react';
import { useSmartOrientation } from '@/hooks/useSmartOrientation';

export default function PomodoroTimer() {
  const { durationMinutes } = useSmartOrientation();

  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [isActive, setIsActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error(err);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLock) {
        wakeLock.release().catch(console.error);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    setSecondsLeft(durationMinutes * 60);
    setIsActive(true);
  }, [durationMinutes]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const handleInteraction = () => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    if (timeSinceLastClick < 300) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      setSecondsLeft(durationMinutes * 60);
      setIsActive(true);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        setIsActive((prev) => !prev);
      }, 300);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (totalSeconds: number) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div
      onClick={handleInteraction}
      className="fixed inset-0 w-full h-full bg-black flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden touch-manipulation"
    >
      <div
        className="font-bold text-white leading-none tracking-tighter tabular-nums"
        style={{ fontSize: 'clamp(15vh, 25vw, 40vh)' }}
      >
        {formatTime(secondsLeft)}
      </div>

      <button
        onClick={toggleFullscreen}
        className="absolute bottom-6 right-6 p-4 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm z-50"
        aria-label="Toggle Fullscreen"
      >
        {isFullscreen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2-2v3" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        )}
      </button>
    </div>
  );
}
