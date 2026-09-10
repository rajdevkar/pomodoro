import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

export type EndSoundId = "off" | "melody" | "chime" | "bell" | "beep";
export type TickSoundId = "off" | "soft" | "click" | "wood";

type Note = { freq: number; start: number; duration: number; gain?: number };

const SAMPLE_RATE = 22050;

const END_SOUNDS: Record<Exclude<EndSoundId, "off">, Note[]> = {
  melody: [
    { freq: 523.25, start: 0, duration: 0.2 },
    { freq: 659.25, start: 0.2, duration: 0.2 },
    { freq: 783.99, start: 0.4, duration: 0.2 },
    { freq: 1046.5, start: 0.6, duration: 0.4 },
  ],
  chime: [
    { freq: 784, start: 0, duration: 0.35, gain: 0.28 },
    { freq: 1175, start: 0.12, duration: 0.45, gain: 0.22 },
  ],
  bell: [
    { freq: 880, start: 0, duration: 0.8, gain: 0.32 },
    { freq: 1760, start: 0, duration: 0.55, gain: 0.12 },
    { freq: 2640, start: 0, duration: 0.35, gain: 0.06 },
  ],
  beep: [{ freq: 880, start: 0, duration: 0.18, gain: 0.35 }],
};

const TICK_SOUNDS: Record<Exclude<TickSoundId, "off">, Note[]> = {
  soft: [{ freq: 1200, start: 0, duration: 0.03, gain: 0.12 }],
  click: [{ freq: 2200, start: 0, duration: 0.018, gain: 0.22 }],
  wood: [{ freq: 420, start: 0, duration: 0.04, gain: 0.2 }],
};

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  if (typeof btoa === "function") {
    return btoa(binary);
  }

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

function createWavBase64(notes: Note[]): string {
  const totalSeconds =
    Math.max(...notes.map((note) => note.start + note.duration)) + 0.05;
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
        const attack = Math.min(1, localT / 0.01);
        const release = Math.max(0, 1 - localT / note.duration);
        const envelope = attack * release;
        const gain = note.gain ?? 0.3;
        sample += Math.sin(2 * Math.PI * note.freq * localT) * gain * envelope;
      }
    }

    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, clamped * 0x7fff, true);
  }

  return encodeBase64(new Uint8Array(buffer));
}

function playWebNotes(notes: Note[]) {
  const AudioContextCtor =
    typeof window !== "undefined"
      ? window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      : undefined;

  if (!AudioContextCtor) return;

  const ctx = new AudioContextCtor();
  notes.forEach(({ freq, start, duration, gain = 0.3 }) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.frequency.value = freq;
    osc.type = "sine";

    const t0 = ctx.currentTime + start;
    gainNode.gain.setValueAtTime(0, t0);
    gainNode.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t0 + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration);
  });
}

const soundUriCache = new Map<string, string>();
type NativeSound = import("expo-av").Audio.Sound;
let activeSound: NativeSound | null = null;

async function ensureSoundFile(
  cacheKey: string,
  notes: Note[],
): Promise<string | null> {
  const cached = soundUriCache.get(cacheKey);
  if (cached) return cached;
  if (!FileSystem.cacheDirectory) return null;

  const path = `${FileSystem.cacheDirectory}timo-${cacheKey}.wav`;
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await FileSystem.writeAsStringAsync(path, createWavBase64(notes), {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
  soundUriCache.set(cacheKey, path);
  return path;
}

async function playNativeNotes(cacheKey: string, notes: Note[]) {
  const { Audio } = await import("expo-av");

  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  const uri = await ensureSoundFile(cacheKey, notes);
  if (!uri) return;

  if (activeSound) {
    await activeSound.unloadAsync().catch(() => undefined);
    activeSound = null;
  }

  const { sound } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true, volume: 1 },
  );
  activeSound = sound;

  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      sound.unloadAsync().catch(() => undefined);
      if (activeSound === sound) activeSound = null;
    }
  });
}

async function playNotes(cacheKey: string, notes: Note[]) {
  try {
    if (Platform.OS === "web") {
      playWebNotes(notes);
      return;
    }
    await playNativeNotes(cacheKey, notes);
  } catch (error) {
    console.warn("Failed to play sound", error);
  }
}

/** @deprecated Prefer playEndSound("melody") */
export async function playNotificationSound() {
  await playEndSound("melody");
}

export async function playEndSound(soundId: EndSoundId) {
  if (soundId === "off") return;
  await playNotes(`end-${soundId}`, END_SOUNDS[soundId]);
}

export async function playTickSound(soundId: TickSoundId) {
  if (soundId === "off") return;
  await playNotes(`tick-${soundId}`, TICK_SOUNDS[soundId]);
}
