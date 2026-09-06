# Timo (Expo)

A minimalist Pomodoro timer built with Expo (React Native) for iOS, Android, and web.

## Features

- Countdown timer with start / pause / reset
- Adjustable duration (1–60 minutes) and step amounts
- Theme (light / dark), font family, and font size settings
- Persisted timer + settings via AsyncStorage
- Screen keep-awake while the timer runs
- Local notification + melody when the timer finishes (native)
- Web completion sound via Web Audio API

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
| `npm run build:web` | Export static web build to `dist/` |
| `npm run typecheck` | TypeScript check |
| `npm run eas:init` | Link project to Expo (first-time EAS setup) |
| `npm run eas:build:preview` | Internal iOS + Android builds |
| `npm run eas:build:production` | Production store builds |
| `npm run eas:submit` | Submit latest production builds to stores |

## Deployment

### Web (Vercel)

The project exports a static web build via Expo Metro.

1. Push to GitHub — Vercel picks up [`vercel.json`](vercel.json) automatically
2. In the Vercel dashboard, set **Framework Preset** to **Other**
3. Confirm:
   - **Build Command:** `npx expo export --platform web`
   - **Output Directory:** `dist`
4. Redeploy

Verify locally before pushing:

```bash
npm run build:web
npx serve dist
```

### iOS & Android (EAS Build + Submit)

#### Prerequisites

| Requirement | Purpose |
| --- | --- |
| [Expo account](https://expo.dev) | EAS project hosting |
| [Apple Developer Program](https://developer.apple.com/programs/) ($99/yr) | iOS App Store |
| [Google Play Console](https://play.google.com/console) ($25 one-time) | Android Play Store |

#### One-time setup

```bash
npx eas-cli login
npm run eas:init
```

`eas init` links this repo to an EAS project and writes `extra.eas.projectId` into [`app.json`](app.json).

For CI / GitHub Actions, add an [`EXPO_TOKEN`](https://expo.dev/accounts/[account]/settings/access-tokens) secret to the repository.

#### Preview builds (internal testing)

```bash
npm run eas:build:preview
```

Install the builds on physical devices and verify:

- Timer accuracy when the app is backgrounded
- Notification permission prompt + timer-finished alert
- Keep-awake while the timer runs
- Completion sound (including iOS silent mode)

#### Production builds + store submission

```bash
npm run eas:build:production
npm run eas:submit
```

Or trigger via GitHub Actions:

- **Release published** → production build + submit
- **Manual workflow** → choose `preview` or `production` profile

You still need to complete store listing metadata (screenshots, description, privacy policy URL) in App Store Connect and Google Play Console.

### Bundle identifiers

| Platform | ID |
| --- | --- |
| iOS | `dev.rajdevkar.timo` |
| Android | `dev.rajdevkar.timo` |

## Architecture

- **Expo Router** — file-based routing (`app/`)
- **Jotai + AsyncStorage** — persisted timer and settings state
- **StyleSheet** — cross-platform styling
- **expo-notifications** — native timer-finished alerts
- **expo-av** — generated WAV melody on native; Web Audio API on web
- **expo-keep-awake** — prevents screen sleep during active timer

## Font mapping

| Original (web) | Expo |
| --- | --- |
| Geist | Space Grotesk |
| Doto | Outfit |
| Fascinate | Fascinate |
| Sixtyfour | Sixtyfour |
| Orbitron | Orbitron |
