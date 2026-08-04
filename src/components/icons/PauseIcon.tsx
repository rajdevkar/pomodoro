import React from "react";
import Svg, { Rect } from "react-native-svg";

export default function PauseIcon({
  color = "currentColor",
  size = 24,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Rect x="6" y="4" width="4" height="16" />
      <Rect x="14" y="4" width="4" height="16" />
    </Svg>
  );
}
