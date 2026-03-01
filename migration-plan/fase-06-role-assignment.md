# Fase 6 — RoleAssignment (revelación de roles)

## Componente original

`/Projects/el-impostor-helper/src/components/RoleAssignment.tsx`

Un solo componente con 3 estados internos:
1. **Privacy Screen** (`!isRoleVisible`): "Turno de X", advertencia de privacidad, barra de progreso
2. **Role Reveal** (`isRoleVisible`): Muestra IMPOSTOR (rojo) o CIVIL (verde + palabra secreta)
3. **Game Complete** (`phase === "complete"`): Resumen del juego + botones de acción

## Qué se copia
- Flujo de 3 estados con `isRoleVisible` local + `gameState.phase`
- Textos en español (instrucciones, advertencias, reglas)
- Lógica de `isLastPlayer` para cambiar texto del botón
- Resumen del juego en pantalla complete

## Qué se adapta
- shadcn/ui → View/Text/Pressable + NativeWind
- lucide-react → @expo/vector-icons (Ionicons)
- CSS gradients en texto → colores sólidos
- Barra progreso → View con width porcentual
- "ERES IMPOSTOR/CIVIL" → "SOS IMPOSTOR/CIVIL" (voseo argentino)
- 2 botones → 3 botones ("Misma categoría", "Nueva ronda", "Volver al inicio")
- Categoría display → usa CATEGORY_OPTIONS para label legible

## Qué se descarta
- backdrop-blur-sm, drop-glow, shadow-glow, animate-pulse
- bg-clip-text text-transparent (gradients en texto)
- hover states
- gradient-card utility

## Dependencias
Ninguna nueva. Usa GameContext, Ionicons, expo-router, NativeWind existentes.
