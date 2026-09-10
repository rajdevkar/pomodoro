# Timo (Expo)

A minimalist Pomodoro timer built with Expo (React Native) for iOS, Android, and web.

## Features

- Countdown timer with start / pause / reset
- Dual minute/second wheels to set duration
- Theme (light / dark)
- Persisted timer + settings via AsyncStorage
- Screen keep-awake while the timer runs
- Local notification + end sounds when the timer finishes (native)
- Interactive home-screen widget (iOS + Android) with play / pause
- iOS Live Activity / Dynamic Island countdown while focusing
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

> **Widgets & Dynamic Island** require a native binary. They are **not available in Expo Go**. After installing `expo-widgets`, create a new development or preview build (`npm run eas:build:preview` or the `development` EAS profile), install it on a device, then add the **Timo** widget from the home-screen gallery. On iPhone, start the timer to show the Live Activity in Dynamic Island / Lock Screen.

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
- Home-screen **Timo** widget play / pause (iOS + Android)
- iOS Dynamic Island / Lock Screen Live Activity while the timer runs

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

- **Jotai + AsyncStorage** — persisted timer and settings state
- **StyleSheet** — cross-platform styling
- **expo-notifications** — native timer-finished alerts
- **expo-audio** — generated WAV sounds on native; Web Audio API on web
- **expo-keep-awake** — prevents screen sleep during active timer
- **expo-widgets + @expo/ui** — home-screen widget and iOS Live Activity / Dynamic Island

## Font mapping

| Original (web) | Expo |
| --- | --- |
| Geist | Space Grotesk |
