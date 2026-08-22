# AGENTS.md — AuraCal

Constitution for any AI agent or human working in this repository. Read fully before touching code.

## What this is

**AuraCal** is a prayer-native calendar: a day organized around the five prayers (*waqt* windows) instead of uniform clock hours, planned at Maghrib, built for diaspora Muslims who structure life around Fajr, not 9 AM.

The product spec lives in **[plan.md](./plan.md)** — single source of truth for scope. Read the current milestone before implementing anything.

## Golden rules

1. **Scope discipline beats capability.** Build only what the active milestone in plan.md defines. No speculative features, no drive-by refactors.
2. **No slop.** No placeholder content, lorem ipsum, dead code, fake-done stubs, or generic dashboard aesthetics.
3. **Verify before claiming done.** `tsc` and lint must pass. Never report completion with red checks.
4. **Small diffs.** One logical change per commit. Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).

## Stack (locked — do not swap without editing this file first)

| Layer         | Choice                                          |
| ------------- | ----------------------------------------------- |
| App framework | Expo (latest stable SDK) + expo-router          |
| Language      | TypeScript, `strict: true`                      |
| Styling       | NativeWind v4 (Tailwind tokens)                 |
| Local DB      | `expo-sqlite` + Drizzle ORM                     |
| Prayer math   | `adhan-js` — computed locally, never network    |
| State         | Zustand                                         |
| Dates         | `date-fns` + `Intl` API for Hijri               |

Expo and RN ecosystems move fast: **always check current APIs through the Context7 MCP** (e.g. `/expo/expo-documentation`, `/websites/adhan-js`) instead of trusting training memory.

## Architecture

Clean architecture with an enforced dependency direction:

```
src/
  app/                # expo-router routes — THIN screens only (compose, never compute)
  features/           # vertical slices, self-contained
    day-view/
    evening-ritual/
    settings/
      components/     # feature-specific UI
      hooks/          # feature logic exposed to screens
      model/          # feature types + zustand slices
  core/               # framework-agnostic domain layer
    prayer-engine/    # adhan-js wrapper: prayer times, waqt windows, qiyam/last-third calc
    calendar-store/   # device calendar adapter via expo-calendar (read overlay → write-back)
    db/               # Drizzle schema + migrations
    hijri/            # conversion + manual moon-sighting offset
    config/           # calculation methods, high-latitude rules, defaults
  ui/                 # design-system primitives ONLY (Button, Card, Sheet, tokens)
```

**Dependency rule:** `app → features → core → ui`

- `core` imports nothing from `features`, `app`, or React Native UI primitives. Pure TypeScript + domain libs only.
- `features` import `core` + `ui`; never another feature's internals.
- Screens (`app/`) wire hooks into layout; all logic lives in hooks or `core`.

## Domain rules (non-negotiable)

1. Prayer times are **always computed locally** with `adhan-js`. No network requests for prayer data, ever. This is also the privacy promise.
   - Verified: `adhan-js` returns absolute instants independent of the input Date's timezone frame (same calendar day in any offset yields identical results). Pass ordinary device-local dates.
2. **Anchor precedence:** user's masjid iqamah schedule > calculated adhan time. Muslims schedule around congregation times, not astronomy.
3. **High-latitude safety:** every location carries a `HighLatitudeRule` (middle of the night / seventh of the night / twilight angle). Times must resolve for Helsinki as correctly as for Cairo. Never return null or crash.
4. **Hijri dates** come from system calendar APIs plus a user-adjustable ±2-day offset (local moon-sighting override). Never hardcode offsets.
5. **Travel/location change** triggers full recalculation of anchored routines while fixed clock events stay untouched. V0: show a recalculation banner; jam/qasr suggestions are V1+.

## Design law

- **Dark mode first.** This app gets opened at 4 AM and after Isha.
- **Tokens only.** Colors, spacing, radii, type scale defined once in the NativeWind/Tailwind preset. Zero magic values in screens.
- **Typography:** IBM Plex Sans Arabic for Arabic UI text; Amiri for Quranic text. Arabic renders RTL always, even embedded in LTR layouts.
- **Aesthetic references:** Notion Calendar, Things 3, Rise, Linear. Calm, spacious, one accent color, generous whitespace.
- **Forbidden:** emerald-green-gold clichés, ornamental pattern wallpaper, gradient soup, emoji as icons, mosque-silhouette clip art. Arabic calligraphy appears sparingly and beautifully — jewelry, not wallpaper.
- **Motion:** 150–250 ms ease-out, used as feedback only. Nothing bounces for attention.

## Workflow

1. Read plan.md (active milestone) before any feature work. Ambiguity → ask, don't guess scope.
2. Track multi-step work with the task list; keep statuses truthful.
3. Place new code exactly where the architecture table says.
4. Verify: `npx tsc --noEmit`, `npm run lint`, `npm test`. Iterate until green.
5. Commit small, message conventional. Push on milestone completion or when asked.
6. Keep plan.md progress markers updated as milestones land.
7. Never commit secrets, `node_modules`, or build output.

## Definition of done

- [ ] `tsc` + lint + `npm test` green
- [ ] Token-compliant styling (no raw values)
- [ ] Loading / error / empty states handled
- [ ] Dark mode correct (it is the default)
- [ ] RTL-safe wherever Arabic appears
- [ ] plan.md updated if reality diverged from plan
