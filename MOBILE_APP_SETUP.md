# AURA Tennis — Native App Setup

This repository uses React + Vite for the shared UI and Capacitor to package it as iOS and Android apps.

## Requirements

- Node.js 22+
- Xcode 26+ and Xcode Command Line Tools for iOS builds (macOS required)
- Android Studio and Android SDK for Android builds

## Install and run

```bash
npm install
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

After the native platform folders have been created, for subsequent web changes run:

```bash
npm run cap:sync
```

Open the native projects:

```bash
npm run cap:open:ios
npm run cap:open:android
```

Use Xcode to run on an iPhone/simulator and configure iOS signing. Use Android Studio to run on a device/emulator and create a signed Android App Bundle (AAB).

## App identity

- Display name: AURA Tennis
- Bundle / application ID: `com.auratennis.tournamentnavigator`

Treat this ID as permanent once the first store release is published. Store publishing requires the developer accounts, signing credentials, store listings, privacy disclosures, and platform review. This repository setup does not publish the app automatically.

## Before store submission

- Test sign-in, session persistence, saved tournaments, notes, profile, and logout on physical devices.
- Confirm that saved tournaments and notes persist across devices. If they are still stored in browser/local storage, migrate them to authenticated server storage before marketing cross-device sync.
- Add and verify app icons, splash screen, privacy policy, support contact, and account deletion if account creation is available.
- Review external tournament links and network/error states in the native WebView.
- Ensure the app provides useful app-specific functionality; a thin website wrapper may be rejected by Apple.
