import { useAtomValue } from "jotai";
import React from "react";
// removed duplicate themeAtom import since it is imported with others below
import {
  themeAtom
} from "@/store/atoms";
import CloseIcon from "./icons/CloseIcon";
import MinusIcon from "./icons/MinusIcon";
import PauseIcon from "./icons/PauseIcon";
import PlayIcon from "./icons/PlayIcon";
import PlusIcon from "./icons/PlusIcon";
import ResetIcon from "./icons/ResetIcon";
import SettingsIcon from "./icons/SettingsIcon";
import SettingsControl from "./SettingsControl";

interface BottomControlsProps {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onSettingsToggle: () => void;
  isSettingsOpen: boolean;
}

const BottomControls: React.FC<BottomControlsProps> = ({
  isActive,
  onToggle,
  onReset,
  onIncrement,
  onDecrement,
  onSettingsToggle,
  isSettingsOpen,
}) => {
  const theme = useAtomValue(themeAtom);

  const buttonClass = `p-4 rounded-full backdrop-blur-sm transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center ${theme === "dark"
    ? "bg-white/10 hover:bg-white/20 text-white"
    : "bg-black/5 hover:bg-black/10 text-black"
    }`;

  // Helper for invisible buttons to maintain layout spacing
  const renderButton = (
    visible: boolean,
    icon: React.ReactNode,
    onClick: () => void,
    label: string
  ) => {
    return (
      <div className="flex-1 flex justify-center">
        <button
          onClick={onClick}
          className={`${buttonClass} ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          aria-label={label}
          tabIndex={visible ? 0 : -1}
        >
          {icon}
        </button>
      </div>
    );
  };

  return (
    <div
      className="fixed bottom-8 left-0 right-0 z-50 flex justify-center items-center px-6 pointer-events-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center gap-4 w-full max-w-lg pointer-events-auto">
        {/* 1. Reset (Visible only when stopped) */}
        {renderButton(!isActive, <ResetIcon />, onReset, "Reset Timer")}

        {/* 2. Decrement (Visible only when stopped) */}
        {renderButton(!isActive, <MinusIcon />, onDecrement, "Decrease Time")}

        {/* 3. Start/Stop (Always visible) */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={onToggle}
            className={`${buttonClass} scale-110`} // Slightly larger
            aria-label={isActive ? "Pause Timer" : "Start Timer"}
          >
            {isActive ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>

        {/* 4. Increment (Visible only when stopped) */}
        {renderButton(!isActive, <PlusIcon />, onIncrement, "Increase Time")}

        {/* 5. Settings (Always visible) */}
        <div className="flex-1 flex justify-center relative">
          <button
            onClick={onSettingsToggle}
            className={buttonClass}
            aria-label="Settings"
          >
            {isSettingsOpen ? <CloseIcon /> : <SettingsIcon />}
          </button>

          <SettingsControl
            isOpen={isSettingsOpen}
            onClose={onSettingsToggle}
          />
        </div>
      </div>
    </div>
  );
};

export default BottomControls;
