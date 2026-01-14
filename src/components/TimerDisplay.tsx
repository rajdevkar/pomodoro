"use client";

import { useAtomValue } from "jotai";
import { themeAtom, fontIndexAtom, fontSizePercentAtom } from "@/store/atoms";
import React, { useEffect } from "react";

interface TimerDisplayProps {
  timeLeftMs: number;
  handleInteraction: (e: React.MouseEvent) => void;
}

import { fonts } from "@/constants/timerConstants";
import { formatTime } from "@/utils/timeUtils";

export default function TimerDisplay({
  timeLeftMs,
  handleInteraction,
}: TimerDisplayProps) {
  const theme = useAtomValue(themeAtom);
  const fontIndex = useAtomValue(fontIndexAtom);
  const fontSizePercent = useAtomValue(fontSizePercentAtom);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <div
      onClick={handleInteraction}
      className={`fixed inset-0 w-full h-full flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden touch-manipulation transition-colors duration-300 ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <div
        className="font-bold leading-none tracking-tighter tabular-nums transition-all duration-300 ease-in-out"
        style={{
          fontSize: `clamp(${(fontSizePercent / 2) * 0.6}vh, ${fontSizePercent / 2}vw, ${(fontSizePercent / 2) * 1.6}vh)`,
          fontFamily: fonts[fontIndex],
        }}
      >
        {formatTime(timeLeftMs)}
      </div>
    </div>
  );
}
