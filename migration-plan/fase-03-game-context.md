# Fase 3 — GameContext + useWordHistory

## Resumen

Migra la lógica de juego central: el contexto React y el hook de historial de palabras.

| Archivo destino             | Origen PWA                       | Acción   | Cambios principales                              |
|-----------------------------|----------------------------------|----------|--------------------------------------------------|
| `context/GameContext.tsx`   | `src/context/GameContext.tsx`     | Adaptado | toast→Alert.alert, sync→async, imports relativos |
| `hooks/useWordHistory.ts`  | `src/hooks/use-word-history.ts`  | Adaptado | sync→async, renombrado a camelCase               |

## Detalle de cambios

### context/GameContext.tsx

- `toast()` de shadcn/ui reemplazado por `Alert.alert` de react-native (6 call sites)
- `getAvailableWords`, `addUsedWord`, `clearAllAppData` ahora son async → todos los call sites usan `await`
- Funciones que se vuelven async: `getRandomWord`, `getRandomWordFromAllCategories`, `selectSecretWord`, `startGame`, `startNewRoundSameCategory`, `resetAllData`
- Funciones que NO cambian: `assignRoles`, `nextPlayer`, `resetGame`, `startNewRound`
- Import paths cambian de `@/` a relativos (`../types/game`, `../services/wordHistory`)
- `GameContextType`: `startGame`, `startNewRoundSameCategory`, `resetAllData` retornan `Promise<void>` en vez de `void`

### hooks/useWordHistory.ts

- Renombrado de `use-word-history.ts` (kebab-case) a `useWordHistory.ts` (camelCase)
- Todas las funciones del hook se vuelven async y retornan `Promise<T>`
- El patrón de `version` state para forzar re-renders se mantiene sin cambios
- Import paths usan relativos (`../services/wordHistory`)

## Descartado

- `toast()` / `useToast` de shadcn/ui (web-only)
- No se necesitan dependencias nuevas (`Alert` ya viene con `react-native`)

## Impacto en fases siguientes

- `GameProvider` se conectará al app tree en `app/_layout.tsx` cuando se migre la primera pantalla que use `useGame()` (Fase 5 o 6)
- `useGame` queda disponible para todas las pantallas de juego
