# Fase 8: PremiumFeatureModal + useSubscription stub

## Estado: Completada

## Qué se copió
- **Concepto de `isVIP`/`isPremium`** como boolean flag consultable por los componentes
- **Patrón de integración**: estado `showPremiumModal` en la pantalla principal, modal se abre al tocar la card premium

## Qué se adaptó
- **PremiumFeatureModal**: reescrito desde cero con React Native `Modal` + NativeWind. Diseño consistente con la app (bg-surface, accent celeste, sparkles amarillo). Sin pricing ni botón de compra — solo informativo.
- **SubscriptionContext → useSubscription hook**: simplificado de un Provider completo a un hook stub que retorna constantes. Se puede refactorear a Context cuando haya billing real.

## Qué se descartó
- `SubscriptionContext.tsx` completo — Provider con Google Play billing, Digital Goods API, token verification, caching en localStorage
- `useBilling()` hook — Digital Goods API, product details, purchase flow
- Pricing card, precios semanales/mensuales, formato de moneda
- Botón "Suscribirse a VIP" y flujo de compra
- Fallback a Play Store
- Toast de éxito/error de compra
- `onSubscribeSuccess` callback
- Todo lo relacionado con Google Play (la app es solo iOS)

## Archivos creados
- `hooks/useSubscription.ts` — Hook stub (`isPremium: false`, `isLoading: false`)
- `components/PremiumFeatureModal.tsx` — Modal informativo premium
- `__tests__/useSubscription.test.ts`
- `__tests__/PremiumFeatureModal.test.tsx`

## Archivos modificados
- `components/AiPremiumCard.tsx` — Agregado prop `onPress`, removido `Alert.alert()`
- `app/index.tsx` — Conectado modal state + card + render
- `__tests__/GameSetup.test.tsx` — Actualizado test de AI card press
