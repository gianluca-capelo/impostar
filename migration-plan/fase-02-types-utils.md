# Fase 2 — Types y utilidades puras

## Resumen

Se migran 3 archivos desde la PWA original (`/Projects/el-impostor-helper/src/`):

| Archivo destino | Acción | Cambios |
|-----------------|--------|---------|
| `types/game.ts` | Copia exacta | Ninguno — 100% portable |
| `services/ai.ts` | Adaptado | URL relativa → absoluta (`https://impostar.app/api/generate-words`) |
| `services/wordHistory.ts` | Adaptado | `localStorage` → `AsyncStorage`, todas las funciones pasan a `async` |

---

## Detalle por archivo

### types/game.ts — Sin cambios
- `WordCategory`: union type con 19 categorías
- `Player`: interface (id, name, isImpostor)
- `GameState`: interface (players, numberOfPlayers, numberOfImpostors, secretWord, category, phase, currentPlayerIndex)
- `WORD_LISTS`: constante con 16 categorías mapeadas a arrays de strings (~30-45 palabras c/u)

Sin imports, sin dependencias del browser.

### services/ai.ts — URL absoluta
- `GenerateWordsResponse`, `GenerateWordsError`: interfaces sin cambios
- `generateWordsFromDescription(description, purchaseToken?)`: único cambio es la URL del fetch
- `fetch` nativo de React Native es compatible, `HeadersInit` disponible en tipos globales
- Se mantiene el header `X-Purchase-Token` para compatibilidad futura con suscripciones (Fase 8)

### services/wordHistory.ts — localStorage → AsyncStorage
- Import: `@react-native-async-storage/async-storage` (ya instalado en Fase 1)
- Storage keys renombrados: `"impostar-word-history"`, `"impostar-setup"`
- Todas las funciones que tocan storage pasan a `async` / `Promise<T>`
- `normalizeWord()` sigue sync (manipulación de string pura)
- `clearAllAppData()` usa `AsyncStorage.multiRemove()` para atomicidad
- `SETUP_STORAGE_KEY` se mantiene para Fase 4 (useGameSetup)

---

## Descartado

| Archivo original | Razón |
|------------------|-------|
| `hooks/use-word-history.ts` | Hook React que wrappea el servicio. Se adapta en Fase 3 (las funciones ahora son async) |
| `types/subscription.ts` | Fase 8 |
| `types/digital-goods.ts` | Google Play específico, no aplica a iOS |
| `services/billing.ts` | Google Play Digital Goods API |
| `services/subscription.ts` | Fase 8 |
| `lib/utils.ts` (fn `cn`) | Web-only (tailwind-merge + clsx), NativeWind no lo necesita |
| `context/GameContext.tsx` | Fase 3 |

---

## Impacto en Fase 3

`GameContext.tsx` llama funciones de `wordHistory.ts` sincrónicamente en 7 lugares. En Fase 3 todos esos call sites necesitarán `await`.
