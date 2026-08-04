# Timo (Expo)

A minimalist Pomodoro timer, migrated from Next.js to Expo (React Native).

## Features

- Countdown timer with start / pause / reset
- Adjustable duration (1–60 minutes) and step amounts
- Theme (light / dark), font family, and font size settings
- Persisted timer + settings via AsyncStorage
- Screen keep-awake while the timer runs
- Local notification + melody when the timer finishes

## Getting Started

```bash
npm install
npm start
```

Then press:

- `a` for Android emulator / device
- `i` for iOS simulator (macOS)
- `w` for web
- or scan the QR code with Expo Go

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run android` | Open on Android |
| `npm run ios` | Open on iOS |
| `npm run web` | Open in browser |
| `npm run typecheck` | TypeScript check |

## Architecture notes

- **Expo Router** replaces the Next.js App Router (`app/`)
- **Jotai + AsyncStorage** replaces `localStorage` persistence
- **StyleSheet** replaces Tailwind CSS
- **expo-notifications** replaces the Web Notification API
- **expo-av** plays a generated WAV melody (same notes as the web app)
- **expo-keep-awake** replaces the Screen Wake Lock API
- PWA / Serwist service worker was removed (native apps do not need it)

## Font mapping

| Web (next/font) | Expo |
| --- | --- |
| Geist | Space Grotesk |
| Doto | Outfit |
| Fascinate | Fascinate |
| Sixtyfour | Sixtyfour |
| Orbitron | Orbitron |
