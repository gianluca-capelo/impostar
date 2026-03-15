# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Impostar

A Spanish-language party game app (similar to "The Impostor" / "Spyfall"). Players receive a secret word except impostors, who must bluff. Built with Expo/React Native targeting iOS, Android, and web.

## Commands

```bash
npx expo start          # Dev server (or: npm start)
npx expo start --web    # Web only
npm test                # Run all tests (Jest)
npx jest path/to/file   # Run a single test file
npx tsc --noEmit        # Type-check without emitting
```

Supabase Edge Functions (Deno runtime):
```bash
npx supabase functions serve   # Local dev
npx supabase functions deploy generate-words
```

## Architecture

**Expo Router** file-based routing in `app/`:
- `_layout.tsx` — Root layout wrapping everything in `SafeAreaProvider` + `GameProvider`
- `index.tsx` — Main game screen (setup → role reveal → complete)
- `settings.tsx`, `faq.tsx`, `privacy.tsx`, `roles.tsx` — Secondary screens

**State management** — Single `GameContext` (`context/GameContext.tsx`) holds all game state. Game phases: `setup` → `roles` → `complete`. No external state library.

**Services layer** (`services/`):
- `ai.ts` — Calls Supabase Edge Function `generate-words` via `supabase.functions.invoke()` with 30s timeout and AbortController support
- `aiWords.ts` — Persists AI-generated words in AsyncStorage
- `wordHistory.ts` — Tracks used words per category in AsyncStorage to avoid repeats
- `gameSetup.ts` — Game configuration logic

**Supabase Edge Function** (`supabase/functions/generate-words/`):
- Deno runtime, calls Groq API (Llama 3.3 70B) to generate themed words
- Two-pass: generate words → validate semantically with AI
- Requires `GROQ_API_KEY` secret

**Supabase client** (`lib/supabase.ts`) — Initialized with env vars `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`, uses AsyncStorage for auth persistence.

**Styling** — NativeWind (Tailwind CSS for React Native) via `global.css` + `tailwind.config.js`. Dark theme (`#0a0a0a` background).

**Path alias** — `@/*` maps to project root (configured in `tsconfig.json`).

## Key types

All game types live in `types/game.ts`:
- `WordCategory` — Union of all category slugs (Spanish names like `"comida"`, `"películas"`, `"ia_generado"`, `"personalizado"`, `"aleatorio"`)
- `GameState` — Core state with `phase: "setup" | "roles" | "complete"`
- `WORD_LISTS` — Static word banks keyed by category

## Testing

Tests are in `__tests__/` using Jest + `@testing-library/react-native`. Test files mirror source files (e.g., `GameContext.test.tsx`, `ai.test.ts`).

## Important rules

- **Do NOT reference the `first-iteration` branch** — it is not a valid base. Always use `main` or the current branch.
- The app UI is entirely in **Spanish** — all user-facing strings, alerts, and error messages must be in Spanish.
- **Target platform is iOS (Apple App Store) only** — all UI, testing, and development decisions should prioritize iOS. Android and web are not priorities.
- **Run tests after significant changes** (`npm test`) to verify nothing breaks. When adding new functionality, consider adding corresponding test files in `__tests__/`.
- Environment variables use the `EXPO_PUBLIC_` prefix for client-side access.
