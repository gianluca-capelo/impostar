# Roadmap de Migración

Guía rápida de fases pendientes. Para el objetivo completo y reglas ver [original-prompt.md](original-prompt.md).

> **REGLA:** NO mirar ni usar como referencia el branch `first-iteration` — ese branch no está bien. Siempre usar el branch actual.

---

## Estado actual

| Fase | Descripción | Estado |
|------|-------------|--------|
| 0 | Análisis de la PWA original | Completada |
| 1 | Scaffolding Expo + NativeWind + Expo Router | Completada |
| 2 | Types y utilidades puras | Pendiente |
| 3 | GameContext (lógica de juego) | Pendiente |
| 4 | useGameSetup hook (persistencia) | Pendiente |
| 5 | GameSetup (pantalla principal de config) | Pendiente |
| 6 | RoleAssignment (revelación de roles) | Pendiente |
| 7 | Settings + FAQ + Privacy | Pendiente |
| 8 | PremiumFeatureModal + useSubscription stub | Pendiente |
| 9 | Integración final + testing | Pendiente |

---

## Fase 2 — Types y utilidades puras

Copiar types, constantes, word lists y servicios sin dependencias del DOM.
- `types/game.ts` — WordCategory, Player, GameState, WORD_LISTS
- `services/ai.ts` — cliente para `POST /api/generate-words`
- `services/wordHistory.ts` — historial de palabras usadas (localStorage → AsyncStorage)

## Fase 3 — GameContext

Migrar el contexto React con toda la lógica de juego.
- startGame, assignRoles, nextPlayer, resetGame, startNewRound
- Selección de palabras por categoría con historial de uso
- Depende de: tipos + wordHistory (fase 2)

## Fase 4 — useGameSetup hook

Persistencia del setup entre sesiones.
- Cantidad de jugadores, impostores, nombres custom
- localStorage → AsyncStorage

## Fase 5 — GameSetup (pantalla principal)

Componente UI más grande. Config del juego antes de jugar.
- Selector de jugadores (3-12), impostores, categoría (18 opciones)
- Nombres custom opcionales, input de palabras IA (premium, bloqueado)
- Reescribir shadcn/ui (Select, Input, Button, Card) con RN + NativeWind

## Fase 6 — RoleAssignment

Pantalla donde cada jugador ve su rol en privado.
- 3 sub-pantallas: privacidad → revelación → juego completo
- Barra de progreso, botones de nueva ronda / cambiar categoría

## Fase 7 — Settings + FAQ + Privacy

Pantallas secundarias.
- Settings: links a FAQ y Privacidad
- FAQ: acordeón con 3 preguntas + email contacto
- Privacy: texto estático

## Fase 8 — PremiumFeatureModal + useSubscription stub

Stub para fase 2 futura de suscripciones.
- `useSubscription` hook (`isPremium = false` siempre)
- Modal al intentar usar features premium (generación IA)

## Fase 9 — Integración final

Testing completo y checklist de calidad (ver checklist en [original-prompt.md](original-prompt.md)).
