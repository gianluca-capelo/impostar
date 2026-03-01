# Fase 5 — GameSetup Screen (pantalla principal de configuración)

## Origen
`/Projects/el-impostor-helper/src/components/GameSetup.tsx`

## Qué se copió
- Reglas de validación del `handleStartGame` (6 validaciones: jugadores min/max, impostores min/max, palabra personalizada, palabras IA)
- Lista de categorías con emojis (17 categorías: aleatorio + 15 predefinidas + personalizado)
- Flujo de `handleStartGame`: validar → parsear → llamar `startGame()` → navegar
- Flujo de `handleReset`: `resetAllData()` + `clearSetup()` + reset state local
- Estructura de secciones: AI card → categoría → config jugadores → botón jugar → botón reset

## Qué se adaptó
- `Card`/`CardContent`/`CardHeader` (shadcn) → `View` con NativeWind (`bg-surface`, `border-border`, `rounded-2xl`)
- `Select`/`SelectContent`/`SelectItem` (shadcn) → `CategoryPicker` propio con `Modal` + `FlatList` nativo
- `Input` (shadcn) → `TextInput` de RN con NativeWind, `keyboardType="number-pad"` para numéricos
- `Switch` (Radix) → `Switch` de RN con `trackColor` / `thumbColor` del tema
- `Button` (shadcn) → `Pressable` con NativeWind
- `Label` (shadcn) → `Text` con ícono `Ionicons`
- `lucide-react` icons → `@expo/vector-icons/Ionicons`
- `useToast()` → `Alert.alert()` de RN
- Gradiente de texto "AR" → `Text` con `color: #7dd3fc`
- `Link` de react-router-dom → `router.push()` de expo-router
- Sección de IA completa → card con opacidad reducida + badge "PREMIUM" + `Alert.alert` al presionar

## Qué se descartó
- **shadcn/ui**: todos los imports (`Button`, `Input`, `Label`, `Switch`, `Select`, `Card`, `Dialog`)
- **lucide-react**: todos los íconos → reemplazados por `Ionicons`
- **Efectos CSS web-only**: `ai-shimmer`, `ai-glow`, `ai-float`, `ai-pulse`, `ai-gradient-text`, `shadow-glow`, `gradient-card`, `hover:*`, `cursor-pointer`, `animate-in fade-in-50 slide-in-from-top-2`
- **HTML-only**: `htmlFor`/`id` en labels, `type="number"` en inputs
- **PremiumFeatureModal**: diálogo completo → se reemplaza con `Alert.alert` (Fase 8 lo implementa)
- **useSubscription**: hook completo → sin uso (Fase 8)
- **isVIP/Crown**: ícono de corona VIP → omitido (siempre false, Fase 8)
- **Lógica de generación IA**: `handleGenerateWords`, `aiDescription` state, `isGenerating`, `showGeneratedWords`, `generateWordsFromDescription` → todo reemplazado por card premium stub
- **Link a /configuracion**: funcional → `Alert.alert("Próximamente")` (Fase 7 crea la pantalla)

## Archivos creados/modificados
- `utils/validation.ts` — **Nuevo**: validación pura extraída, testeable sin UI
- `utils/categories.ts` — **Nuevo**: array constante con 17 categorías (emoji + label + value)
- `app/_layout.tsx` — **Modificado**: envuelto en `<GameProvider>`
- `components/GameTitle.tsx` — **Nuevo**: título "IMPOSTAR" con "AR" estilizado
- `components/AiPremiumCard.tsx` — **Nuevo**: card de IA bloqueada (stub premium)
- `components/CategoryPicker.tsx` — **Nuevo**: selector de categoría con Modal + FlatList
- `components/PlayerConfig.tsx` — **Nuevo**: inputs de jugadores/impostores + switch de nombres + inputs dinámicos
- `app/index.tsx` — **Reescrito**: pantalla GameSetup completa (reemplaza placeholder)
- `app/roles.tsx` — **Nuevo**: placeholder mínimo para navegación post-startGame (Fase 6 lo reemplaza)
- `__tests__/validation.test.ts` — **Nuevo**: 17 tests de validación pura
- `__tests__/GameSetup.test.tsx` — **Nuevo**: 13 tests de integración de la pantalla

## Tests
- 17 tests de validación (`__tests__/validation.test.ts`): cada regla + edge cases
- 13 tests de integración (`__tests__/GameSetup.test.tsx`): render, interacción, validación, navegación, reset
- Total del proyecto: 66 tests, todos pasando
