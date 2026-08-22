# AuraCal

A prayer-native calendar. Your day organized by the five prayers — planned at Maghrib, alive to the sun.

Built for diaspora Muslims who structure life around Fajr, not 9 AM.

| Doc        | Purpose                                    |
| ---------- | ------------------------------------------ |
| plan.md    | Product spec, milestones, V0 scope         |
| AGENTS.md  | Architecture + workflow rules for AI agents |

## Status

`V0 — feature-complete (M0–M4). TestFlight/Play beta pending store setup.`

## Development

```bash
npm install
npx expo start          # Expo Go works for everything except calendar features
npx tsc --noEmit        # typecheck — must pass before any commit
npm run lint
```

**Calendar read/write requires a development build** (`expo-calendar` is unsupported in Expo Go since SDK 54):

```bash
npx expo run:android    # local dev build
npx expo run:ios
```

## Builds

```bash
eas build -p android --profile preview   # internal APK
eas build -p ios --profile production    # App Store / TestFlight
```

Configure `eas.json` profiles and `eas login` first.
