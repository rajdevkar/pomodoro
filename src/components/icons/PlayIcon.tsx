import React from "react";
import Svg, { Polygon } from "react-native-svg";

export default function PlayIcon({
  color = "currentColor",
  size = 24,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Polygon points="5 3 19 12 5 21 5 3" />
    </Svg>
  );
}
