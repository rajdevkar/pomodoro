"use client";

import { fontNames, stepOptions } from "@/constants/timerConstants";
import {
  durationMinutesAtom,
  fontIndexAtom,
  fontSizePercentAtom,
  isActiveAtom,
  stepMinutesAtom,
  themeAtom,
} from "@/store/atoms";
import { useAtom, useAtomValue } from "jotai";
import React, { useState } from "react";

import CloseIcon from "./icons/CloseIcon";
import PauseIcon from "./icons/PauseIcon";
import SettingsIcon from "./icons/SettingsIcon";

const SettingsControl = React.memo(function SettingsControl() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [theme, setTheme] = useAtom(themeAtom);
  const [fontIndex, setFontIndex] = useAtom(fontIndexAtom);
  const [fontSizePercent, setFontSizePercent] = useAtom(fontSizePercentAtom);
  const [stepMinutes, setStepMinutes] = useAtom(stepMinutesAtom);
  const [durationMinutes, setDurationMinutes] = useAtom(durationMinutesAtom);
  const isActive = useAtomValue(isActiveAtom);

  const toggleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <>
      {/* FAB and Controls Container */}
      <div className="absolute bottom-6 left-6 z-50 flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
        {/* Settings Button */}
        <button
          onClick={toggleSettings}
          className={`p-4 rounded-full backdrop-blur-sm transition-all shadow-lg hover:scale-105 active:scale-95 ${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-black"}`}
          aria-label="Settings"
        >
          {isSettingsOpen ? <CloseIcon /> : <SettingsIcon />}
        </button>

        {/* Status Indicator */}
        {!isActive && (
          <div
            className="p-4 rounded-full transition-all shadow-lg select-none pointer-events-none"
            aria-label="Timer Paused"
          >
            <PauseIcon />
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <>
          {/* Backdrop for outside click */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsSettingsOpen(false)}
          />

          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute bottom-28 left-6 p-6 rounded-2xl shadow-2xl backdrop-blur-xl border z-50 w-80 flex flex-col gap-6 animate-in slide-in-from-bottom-4 fade-in duration-200 overflow-y-auto ${theme === "dark" ? "bg-zinc-900/90 border-zinc-700 text-white" : "bg-white/90 border-zinc-200 text-black"}`}
            style={{ maxHeight: "500px" }}
          >
            {/* Step Count */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider opacity-50">
                Step Amount (Minutes)
              </span>
              <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                {stepOptions.map((step) => (
                  <button
                    key={step}
                    onClick={() => setStepMinutes(step)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${stepMinutes === step ? (theme === "dark" ? "bg-zinc-700 shadow-sm" : "bg-white shadow-sm") : "opacity-50 hover:opacity-100"}`}
                  >
                    {step}m
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Duration */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider opacity-50">
                  Timer Duration
                </span>
                <span className="text-xs font-medium opacity-70">
                  {durationMinutes}m
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                step={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
              />
            </div>

            <div className="h-px bg-black/10 dark:bg-white/10 w-full" />

            {/* Font Family */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider opacity-50">
                Font Family
              </span>
              <div className="grid grid-cols-2 gap-2">
                {fontNames.map((name, i) => (
                  <button
                    key={name}
                    onClick={() => setFontIndex(i)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all truncate ${fontIndex === i ? (theme === "dark" ? "bg-white text-black border-white" : "bg-black text-white border-black") : "border-transparent hover:bg-black/5 dark:hover:bg-white/5"}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider opacity-50">
                  Font Size
                </span>
                <span className="text-xs font-medium opacity-70">
                  {fontSizePercent}%
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                step={1}
                value={fontSizePercent}
                onChange={(e) => setFontSizePercent(Number(e.target.value))}
                className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
              />
            </div>

            {/* Theme */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider opacity-50">
                Theme
              </span>
              <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                {["light", "dark"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t as "light" | "dark")}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${theme === t ? (theme === "dark" ? "bg-zinc-700 shadow-sm" : "bg-white shadow-sm") : "opacity-50 hover:opacity-100"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
});

export default SettingsControl;
