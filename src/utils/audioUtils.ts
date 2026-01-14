export const playNotificationSound = () => {
  // Check if AudioContext is supported
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();

  // Melody: C5, E5, G5, C6 (Major Arpeggio)
  // Frequencies: 523.25, 659.25, 783.99, 1046.50
  const notes = [
    { freq: 523.25, time: 0, duration: 0.2 },
    { freq: 659.25, time: 0.2, duration: 0.2 },
    { freq: 783.99, time: 0.4, duration: 0.2 },
    { freq: 1046.50, time: 0.6, duration: 0.4 },
  ];

  notes.forEach(({ freq, time, duration }) => {
    const osc = ctx.createOscillator();
    const gainUrl = ctx.createGain();

    osc.frequency.value = freq;
    osc.type = "sine"; // Soft tone

    // Envelope
    gainUrl.gain.setValueAtTime(0, ctx.currentTime + time);
    gainUrl.gain.linearRampToValueAtTime(0.3, ctx.currentTime + time + 0.05); // Attack
    gainUrl.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + duration); // Release

    osc.connect(gainUrl);
    gainUrl.connect(ctx.destination);

    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + duration);
  });
};
