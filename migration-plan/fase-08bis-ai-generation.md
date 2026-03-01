# Fase 8bis: Lógica de generación de palabras con IA

## Estado: Completada

## Qué se copió
- **Flujo de interacción**: click en card → seleccionar categoría "ia_generado" → aparece formulario de descripción
- **TextInput de descripción**: max 200 chars, mismo placeholder, misma validación
- **Botón "Generar palabras"**: con loading spinner, disabled cuando vacío o generando
- **Display de palabras generadas**: badges colapsables con toggle "Ver/Ocultar"
- **Botón "Usar categoría predefinida"**: para volver al selector de categorías
- **handleGenerateWords()**: validación de descripción → llamada a API → manejo de éxito/error

## Qué se adaptó
- **Toasts → Alert.alert()**: React Native no tiene toasts nativos, se usa Alert para errores y confirmación
- **Card con estados visuales**: `isActive` + `isLocked` props en AiPremiumCard (opacity, border, badge)
- **Badge dinámico**: "PREMIUM" (amarillo) cuando locked, "ACTIVO" (verde) cuando la categoría está seleccionada
- **Dev flag**: `VITE_MOCK_VIP` env var → constante `DEV_PREMIUM` en useSubscription.ts
- **CSS animations**: shimmer, pulse, glow, float → descartadas (no necesarias para funcionalidad)

## Qué se descartó
- CSS animations del original (shimmer, pulse, glow, float)
- `VITE_MOCK_VIP` env var (reemplazada por constante en código)
- Badge "NUEVO" (no relevante para la app nativa)

## Archivos creados
- `components/AiGenerationForm.tsx` — Formulario con input, botón generate, palabras, botón predefinido
- `__tests__/AiGenerationForm.test.tsx` — Tests del formulario

## Archivos modificados
- `hooks/useSubscription.ts` — Agregado `DEV_PREMIUM` constante
- `components/AiPremiumCard.tsx` — Props `isActive`, `isLocked`, estados visuales
- `app/index.tsx` — Conectado flujo completo: handleAiCardPress, handleGenerateWords, render condicional

## Archivos reutilizados sin cambios
- `services/ai.ts` — API client ya migrado (`generateWordsFromDescription`)
- `context/GameContext.tsx` — `selectSecretWord("ia_generado")` ya implementado
- `utils/validation.ts` — Validación de `aiGeneratedWordsCount` ya implementada
