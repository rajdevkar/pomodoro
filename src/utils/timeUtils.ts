export const pad2 = (value: number): string =>
  value < 10 ? `0${value}` : `${value}`;

export const formatTime = (totalMilliseconds: number): string => {
  const { minutes, seconds } = splitTime(totalMilliseconds);
  return `${pad2(minutes)}:${pad2(seconds)}`;
};

export const splitTime = (totalMilliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(totalMilliseconds / 1000));
  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  };
};

export const clampDurationMs = (milliseconds: number) => {
  const min = 1000;
  const max = 60 * 60 * 1000;
  return Math.min(max, Math.max(min, Math.round(milliseconds)));
};

export const durationFromParts = (minutes: number, seconds: number) => {
  let nextMinutes = Math.min(60, Math.max(0, minutes));
  let nextSeconds = Math.min(59, Math.max(0, seconds));

  if (nextMinutes === 60) {
    nextSeconds = 0;
  }

  const ms = clampDurationMs(nextMinutes * 60 * 1000 + nextSeconds * 1000);
  return splitTime(ms);
};
