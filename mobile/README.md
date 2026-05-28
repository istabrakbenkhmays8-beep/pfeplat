# Advancia Mobile — Expo React Native

Companion app for **advancia-training** that talks to the same REST API as the web.

## What's in here

- **Expo Router** (file-based navigation)
- **expo-secure-store** for the session cookie
- Screens: `/` (home), `/catalog`, `/catalog/[code]`, `/login`
- Shared `lib/api.ts` that injects the NextAuth session cookie on every request

## Run it

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone (same Wi-Fi). The web API is hit at `http://localhost:3000` by default — when running on a physical device, set your machine's LAN IP:

```bash
EXPO_PUBLIC_API_BASE=http://192.168.1.50:3000 npx expo start
```

Or edit `app.json` → `extra.apiBase`.

## Production builds

Use **EAS Build** to ship installable binaries:

```bash
npm install -g eas-cli
eas login
eas build --platform android
# or
eas build --platform ios
```

## Status

This is a deliberately minimal scaffold so jury members can scan a QR code and try the app on their phone. The web app remains the source of truth for admin / super-admin / payments / AI chatbot.

Roadmap:
- [ ] Enrollment + My courses on mobile (currently web-only)
- [ ] Wallet + certificate PDFs
- [ ] Push notifications for session reminders
- [ ] EAS Update OTA channel
