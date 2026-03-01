# Fase 4 — useGameSetup hook (persistencia de configuración)

## Origen
`/Projects/el-impostor-helper/src/hooks/use-game-setup.ts`

## Qué se copió
- Interfaz `GameSetupData` con los 4 campos: `numberOfPlayers`, `numberOfImpostors`, `useCustomNames`, `playerNames`
- Valores por defecto: 5 jugadores, 1 impostor, sin nombres custom
- Lógica de setters: `setNumberOfPlayers` (auto-resize de playerNames), `setNumberOfImpostors`, `setUseCustomNames`, `setPlayerName`
- Auto-save vía `useEffect` cuando el estado cambia
- Merge con spread (`{...DEFAULT_SETUP, ...parsed}`) para manejar evolución de schema
- `clearSetup()` que limpia storage y resetea a defaults

## Qué se adaptó
- `localStorage` → `AsyncStorage` (todas las operaciones ahora son async)
- Carga inicial sincrónica (`useState(getStoredSetup)`) → `useEffect` async con flag `isLoaded`
- Se usa `useRef(isLoadedRef)` para evitar guardar defaults antes de que la carga async termine
- Se separó en 2 archivos (service + hook) siguiendo el patrón de `wordHistory.ts` + `useWordHistory.ts`
- `SETUP_STORAGE_KEY` exportada desde `services/gameSetup.ts` e importada en `wordHistory.ts` para evitar duplicación
- Storage key renombrada: `"el-impostor-setup"` → `"impostar-setup"` (consistente con el nuevo proyecto)

## Qué se descartó
- Nada — toda la lógica del hook original fue migrada

## Archivos creados/modificados
- `services/gameSetup.ts` — **Nuevo**: servicio de persistencia AsyncStorage
- `hooks/useGameSetup.ts` — **Nuevo**: hook de React con la misma API que el original
- `services/wordHistory.ts` — **Modificado**: importa `SETUP_STORAGE_KEY` en vez de hardcodear
- `__tests__/useGameSetup.test.ts` — **Nuevo**: 13 tests cubriendo carga, setters, auto-save, clear, y edge cases
