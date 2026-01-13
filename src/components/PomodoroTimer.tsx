'use client';

import { useEffect, useState, useRef } from 'react';
import { useGestureControl } from '@/hooks/useGestureControl';
import { useWakeLock } from 'react-screen-wake-lock';

export default function PomodoroTimer() {
  const { gesture, requestPermission, permissionGranted, orientation } = useGestureControl();
  const { isSupported, released, request, release } = useWakeLock({
    onRequest: () => console.log('Screen Wake Lock: Requested!'),
    onError: () => console.log('Screen Wake Lock: Error!'),
    onRelease: () => console.log('Screen Wake Lock: Released!'),
  });

  // Timer State
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [stepMinutes, setStepMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [isActive, setIsActive] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Debug State
  const [isDebugMode, setIsDebugMode] = useState(process.env.NODE_ENV === 'development');

  // Font State
  const fonts = ['var(--font-geist-sans)', 'var(--font-doto)', 'var(--font-fascinate)', 'var(--font-sixtyfour)'];
  const fontNames = ['Geist', 'Doto', 'Fascinate', 'Sixtyfour'];
  const [fontIndex, setFontIndex] = useState(0);

  // Size State
  const fontSizes = [
    'clamp(10vh, 15vw, 25vh)',
    'clamp(15vh, 25vw, 40vh)',
    'clamp(20vh, 35vw, 55vh)',
  ];
  const sizeNames = ['Small', 'Medium', 'Large'];
  const [fontSizeIndex, setFontSizeIndex] = useState(1);

  // Manual Timer Options
  const manualTimerOptions = [25, 30, 45, 60];

  // Step Options
  const stepOptions = [1, 5, 10, 15];

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  useEffect(() => {
    document.documentElement.classList.add(theme);
    return () => {
      document.documentElement.classList.remove(theme);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Request Wake Lock on Mount
  useEffect(() => {
    if (isSupported) {
      request();
    }
    return () => {
      // release(); // Optional: release on unmount if needed, but usually fine to keep until tab closes for this app
    };
  }, [isSupported]);


  // Adjustment Logic
  const incrementTime = () => {
    setDurationMinutes((prev) => {
      const newVal = prev + stepMinutes;
      setSecondsLeft(newVal * 60);
      return newVal;
    });
    setIsActive(true);
  };

  const decrementTime = () => {
    setDurationMinutes((prev) => {
      const newVal = Math.max(stepMinutes, prev - stepMinutes);
      setSecondsLeft(newVal * 60);
      return newVal;
    });
    setIsActive(true);
  };

  // Gesture Logic
  useEffect(() => {
    if (gesture === 'tilt-right') {
      incrementTime();
    } else if (gesture === 'tilt-left') {
      decrementTime();
    }
  }, [gesture, stepMinutes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const handleInteraction = () => {
    if (isSettingsOpen) {
      setIsSettingsOpen(false);
      return;
    }

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    if (timeSinceLastClick < 300) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      // Double click: Permission Request + Reset + Wake Lock Re-request (just in case)
      if (!permissionGranted) {
        requestPermission();
      }
      // Ensure wake lock is active on interaction
      if (isSupported && released) {
        request();
      }

      setSecondsLeft(durationMinutes * 60);
      setIsActive(true);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        setIsActive((prev) => !prev);
      }, 300);
    }
  };

  const toggleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSettingsOpen(!isSettingsOpen);
  };

  const formatTime = (totalSeconds: number) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const setManualDuration = (mins: number) => {
    setDurationMinutes(mins);
    setSecondsLeft(mins * 60);
    setIsActive(true);
  };

  return (
    <div
      onClick={handleInteraction}
      className={`fixed inset-0 w-full h-full flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden touch-manipulation transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}
    >
      {/* Debug Overlay */}
      {isDebugMode && (
        <div className="absolute top-4 left-4 z-40 font-mono text-xs bg-black/50 text-white p-2 rounded pointer-events-none backdrop-blur-md border border-white/10">
          <div>Gamma: {orientation.gamma?.toFixed(1)}°</div>
          <div>Gesture: {gesture || 'None'}</div>
          <div>Perm: {permissionGranted ? 'Yes' : 'No'}</div>
          <div>WakeLock: {released ? 'Released' : 'Active'}</div>
          <div className="mt-1 opacity-50 border-t border-white/10 pt-1">
            Tilt Left(-): &lt;-45°<br />
            Tilt Right(+): &gt;45°<br />
            Reset: &lt;20°
          </div>
        </div>
      )}

      <div
        className="font-bold leading-none tracking-tighter tabular-nums transition-all duration-300 ease-in-out"
        style={{
          fontSize: fontSizes[fontSizeIndex],
          fontFamily: fonts[fontIndex]
        }}
      >
        {formatTime(secondsLeft)}
      </div>

      {/* FAB and Controls Container */}
      <div className="absolute bottom-6 left-6 z-50 flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-300">

        {/* Settings Button */}
        <button
          onClick={toggleSettings}
          className={`p-4 rounded-full backdrop-blur-sm transition-all shadow-lg hover:scale-105 active:scale-95 ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}
          aria-label="Settings"
        >
          {isSettingsOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
          )}
        </button>

        {/* Decrement Button */}
        <button
          onClick={(e) => { e.stopPropagation(); decrementTime(); }}
          className={`p-4 rounded-full backdrop-blur-sm transition-all shadow-lg hover:scale-105 active:scale-95 ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}
          aria-label="Decrement Time"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
        </button>

        {/* Increment Button */}
        <button
          onClick={(e) => { e.stopPropagation(); incrementTime(); }}
          className={`p-4 rounded-full backdrop-blur-sm transition-all shadow-lg hover:scale-105 active:scale-95 ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}
          aria-label="Increment Time"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
        </button>

      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-28 left-6 p-6 rounded-2xl shadow-2xl backdrop-blur-xl border z-40 w-80 flex flex-col gap-6 animate-in slide-in-from-bottom-4 fade-in duration-200 overflow-y-auto max-h-[80vh] ${theme === 'dark' ? 'bg-zinc-900/90 border-zinc-700 text-white' : 'bg-white/90 border-zinc-200 text-black'}`}
        >

          {/* Permission Button (only if needed) */}
          {/* {!permissionGranted && (
            <button
              onClick={requestPermission}
              className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Enable Tilt Controls
            </button>
          )} */}

          {/* Debug Toggle */}
          {/* <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider opacity-50">Debug Mode</span>
              <button
                onClick={() => setIsDebugMode(!isDebugMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDebugMode ? (theme === 'dark' ? 'bg-white' : 'bg-black') : 'bg-gray-200 dark:bg-zinc-700'}`}
              >
                <span
                  className={`${isDebugMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full transition-transform ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
                />
              </button>
            </div>
          </div> */}

          <div className="h-px bg-black/10 dark:bg-white/10 w-full" />

          {/* Manual Timer Setter */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider opacity-50">Set Duration</span>
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg">
              {manualTimerOptions.map((mins) => (
                <button
                  key={mins}
                  onClick={() => setManualDuration(mins)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${durationMinutes === mins ? (theme === 'dark' ? 'bg-zinc-700 shadow-sm' : 'bg-white shadow-sm') : 'opacity-50 hover:opacity-100'}`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-black/10 dark:bg-white/10 w-full" />

          {/* Step Count */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider opacity-50">Step Amount (Minutes)</span>
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg">
              {stepOptions.map((step) => (
                <button
                  key={step}
                  onClick={() => setStepMinutes(step)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${stepMinutes === step ? (theme === 'dark' ? 'bg-zinc-700 shadow-sm' : 'bg-white shadow-sm') : 'opacity-50 hover:opacity-100'}`}
                >
                  {step}m
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-black/10 dark:bg-white/10 w-full" />

          {/* Font Family */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider opacity-50">Font Family</span>
            <div className="grid grid-cols-2 gap-2">
              {fontNames.map((name, i) => (
                <button
                  key={name}
                  onClick={() => setFontIndex(i)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all truncate ${fontIndex === i ? (theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black') : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider opacity-50">Font Size</span>
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg">
              {sizeNames.map((name, i) => (
                <button
                  key={name}
                  onClick={() => setFontSizeIndex(i)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${fontSizeIndex === i ? (theme === 'dark' ? 'bg-zinc-700 shadow-sm' : 'bg-white shadow-sm') : 'opacity-50 hover:opacity-100'}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider opacity-50">Theme</span>
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg">
              {['light', 'dark'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t as 'light' | 'dark')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${theme === t ? (theme === 'dark' ? 'bg-zinc-700 shadow-sm' : 'bg-white shadow-sm') : 'opacity-50 hover:opacity-100'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
