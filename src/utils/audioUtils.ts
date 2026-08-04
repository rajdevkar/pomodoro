import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

const SAMPLE_RATE = 22050;

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function createMelodyWavBase64(): string {
  // Melody: C5, E5, G5, C6 (Major Arpeggio) — matches the original web app
  const notes = [
    { freq: 523.25, start: 0, duration: 0.2 },
    { freq: 659.25, start: 0.2, duration: 0.2 },
    { freq: 783.99, start: 0.4, duration: 0.2 },
    { freq: 1046.5, start: 0.6, duration: 0.4 },
  ];

  const totalSeconds = 1.1;
  const numSamples = Math.floor(SAMPLE_RATE * totalSeconds);
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    for (const note of notes) {
      const localT = t - note.start;
      if (localT >= 0 && localT < note.duration) {
        const attack = Math.min(1, localT / 0.05);
        const release = Math.max(0, 1 - localT / note.duration);
        const envelope = attack * release;
        sample += Math.sin(2 * Math.PI * note.freq * localT) * 0.3 * envelope;
      }
    }

    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, clamped * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  if (typeof btoa === "function") {
    return btoa(binary);
  }

  // Hermes / older environments without btoa
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";
  for (let i = 0; i < binary.length; i += 3) {
    const a = binary.charCodeAt(i);
    const b = i + 1 < binary.length ? binary.charCodeAt(i + 1) : 0;
    const c = i + 2 < binary.length ? binary.charCodeAt(i + 2) : 0;
    const bitmap = (a << 16) | (b << 8) | c;
    output +=
      chars.charAt((bitmap >> 18) & 63) +
      chars.charAt((bitmap >> 12) & 63) +
      (i + 1 < binary.length ? chars.charAt((bitmap >> 6) & 63) : "=") +
      (i + 2 < binary.length ? chars.charAt(bitmap & 63) : "=");
  }
  return output;
}

function playWebAudioMelody() {
  const AudioContextCtor =
    typeof window !== "undefined"
      ? window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      : undefined;

  if (!AudioContextCtor) return;

  const ctx = new AudioContextCtor();
  const notes = [
    { freq: 523.25, time: 0, duration: 0.2 },
    { freq: 659.25, time: 0.2, duration: 0.2 },
    { freq: 783.99, time: 0.4, duration: 0.2 },
    { freq: 1046.5, time: 0.6, duration: 0.4 },
  ];

  notes.forEach(({ freq, time, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = freq;
    osc.type = "sine";

    gain.gain.setValueAtTime(0, ctx.currentTime + time);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + time + 0.05);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + time + duration,
    );

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + duration);
  });
}

let soundUri: string | null = null;
let soundObject: Audio.Sound | null = null;

async function ensureSoundFile(): Promise<string | null> {
  if (soundUri) return soundUri;
  if (!FileSystem.cacheDirectory) return null;

  const path = `${FileSystem.cacheDirectory}timo-notification.wav`;
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await FileSystem.writeAsStringAsync(path, createMelodyWavBase64(), {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
  soundUri = path;
  return path;
}

export async function playNotificationSound() {
  try {
    if (Platform.OS === "web") {
      playWebAudioMelody();
      return;
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    const uri = await ensureSoundFile();
    if (!uri) return;

    if (soundObject) {
      await soundObject.unloadAsync();
      soundObject = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, volume: 1 },
    );
    soundObject = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => undefined);
        if (soundObject === sound) soundObject = null;
      }
    });
  } catch (error) {
    console.warn("Failed to play notification sound", error);
  }
}
