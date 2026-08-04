import React from "react";
import Svg, { Line } from "react-native-svg";

export default function MinusIcon({
  color = "currentColor",
  size = 24,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}
