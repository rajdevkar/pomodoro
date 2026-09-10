import React from "react";
import Svg, { Path } from "react-native-svg";

interface ChevronBackIconProps {
  color?: string;
  size?: number;
}

export default function ChevronBackIcon({
  color = "#007AFF",
  size = 22,
}: ChevronBackIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
