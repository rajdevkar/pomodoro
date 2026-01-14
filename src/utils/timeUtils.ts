export const formatTime = (totalMilliseconds: number): string => {
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;

  return `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
};
