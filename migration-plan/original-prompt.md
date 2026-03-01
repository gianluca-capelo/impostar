# Plan de migración: PWA → React Native (iOS)

## Objetivo

Existe una PWA en `/Projects/el-impostor-helper` que es un juego llamado "Impostor". Está hecha con React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui. La app ya funciona en web (impostar.app) y en Google Play Store como TWA. Tiene un backend con Serverless Functions en Vercel (en el mismo repo) que se conecta con Groq AI para generar palabras.

El objetivo es crear un **nuevo proyecto React Native con Expo** en `/Projects/impostor-ios` que replique la funcionalidad del juego para publicarlo en el App Store de iOS. La app React Native consume la misma API de Vercel que ya existe — no se crea backend nuevo.

**Las suscripciones NO se implementan en esta fase.** Se dejan como stubs para una fase 2 futura.

---

## Reglas generales

1. **INCREMENTAL.** Trabajás de a un componente/pantalla por vez. Nunca migrás todo junto.
2. **CONSULTÁ SIEMPRE.** Después de cada fase, pará y mostrá qué hiciste. Esperá aprobación antes de seguir. La estética es importante y necesito revisarla manualmente.
3. **NO SUMES NADA EXTRA.** No agregues librerías, componentes, archivos ni configuraciones que no sean estrictamente necesarios para esta app. Si algo existía en la PWA pero era específico de web (service workers, meta tags, configuración de Vite, PWA manifest, etc.), no lo migres.
4. **NO COPIES SERVERLESS FUNCTIONS.** La carpeta `api/` se queda en el repo original. La app React Native solo consume la API por URL.
5. **NO USES SHADCN/UI.** Es web-only. Reescribí los componentes con React Native + NativeWind.
6. **USÁ `npx expo install`** para instalar dependencias de Expo, no `npm install` directo. Esto asegura compatibilidad de versiones.
8. **NO MIRES EL BRANCH `first-iteration`.** Ese branch no está bien. Usá siempre los archivos del branch actual como referencia.
7. **PLAN POR FASE.** Antes de ejecutar cada fase, creá un archivo en `migration-plan/` explicando qué vas a hacer. Después ejecutá.

---

## Estructura de trabajo

Proyecto original (solo lectura): `/Projects/el-impostor-helper`
Proyecto nuevo: `/Projects/impostor-ios`
Planes de cada fase: `/Projects/impostor-ios/migration-plan/`

---

## Fase 0 — Análisis del proyecto original

**Objetivo:** Entender la app completa antes de tocar nada.

1. Leé toda la estructura de `/Projects/el-impostor-helper/src`
2. Identificá:
   - Todas las pantallas/vistas que tiene el juego
   - Todos los componentes UI (listalos)
   - Todos los hooks custom
   - Todos los types/interfaces de TypeScript
   - Todos los endpoints de la API de Vercel que se consumen
   - Toda la lógica de juego (estado, reglas, flujos)
3. Creá el archivo `migration-plan/fase-00-analisis.md` con:
   - Lista completa de componentes encontrados
   - Lista de pantallas
   - Lista de hooks
   - Lista de types
   - Lista de endpoints de API
   - Propuesta de orden de migración (qué componente primero, cuál después)
   - Qué archivos/código se descarta (web-only, no necesario)
4. **PARÁ Y MOSTRÁ EL ANÁLISIS.** No avances hasta que yo lo apruebe y defina el orden.

---

## Fase 1 — Scaffolding del proyecto (solo estructura vacía)

**Objetivo:** Crear el proyecto Expo con la configuración mínima. Sin componentes todavía.

1. Creá `migration-plan/fase-01-scaffolding.md` explicando qué vas a hacer
2. Ejecutá:
   ```bash
   cd /Projects
   npx create-expo-app impostor-ios --template blank-typescript
   cd impostor-ios
   ```
3. Instalá SOLO las dependencias que realmente necesita la app (basándote en el análisis de la fase 0):
   ```bash
   npx expo install nativewind tailwindcss
   npx expo install expo-router
   npx expo install @expo/vector-icons
   # Solo agregar otras si el análisis mostró que son necesarias
   ```
4. Configurá NativeWind según la doc oficial de v4 para Expo
5. Configurá expo-router con un layout raíz básico
6. Creá la estructura de carpetas vacía:
   ```
   app/
   components/
   hooks/
   utils/
   types/
   migration-plan/
   ```
7. Verificá que `npx expo start --web` levanta sin errores (pantalla en blanco está bien)
8. **PARÁ. Mostrá qué instalaste y la estructura creada.**

---

## Fase 2 — Types y utilidades puras

**Objetivo:** Copiar lo que se reutiliza 100% sin cambios.

1. Creá `migration-plan/fase-02-types-utils.md`
2. Copiá los types/interfaces de TypeScript → `types/`
3. Copiá la lógica de juego pura (sin dependencias del DOM) → `utils/`
4. Copiá constantes → `utils/`
5. Creá `utils/api.ts` con las funciones que llaman a la API de Vercel:
   ```typescript
   const API_BASE = 'https://impostar.app';
   // Replicar los endpoints que identificaste en la fase 0
   ```
6. **NO copies nada que dependa del browser** (localStorage, window, document, navigator). Si algún util lo usa, adaptalo o dejalo para la fase del componente que lo necesite.
7. **PARÁ. Mostrá qué copiaste y qué descartaste.**

---

## Fases 3 en adelante — Un componente/pantalla por fase

A partir de acá, cada fase migra **UN solo componente o pantalla**. El orden lo definimos en la fase 0.

### Para cada componente/pantalla, seguí este proceso:

1. **Creá el plan:** `migration-plan/fase-XX-[nombre-componente].md` con:
   - Qué componente original estás migrando (mostrar el código original)
   - Qué cambios vas a hacer (qué se reescribe, qué se adapta)
   - Qué dependencias necesita (si hay que instalar algo nuevo)
   - Qué descartás (efectos hover, cosas web-only, etc.)

2. **Ejecutá la migración** de ese componente.

3. **PARÁ Y CONSULTÁ.** Mostrá el componente migrado y esperá mi feedback sobre:
   - Estética (¿se ve bien? ¿respeta el diseño original?)
   - Funcionalidad (¿hace lo mismo que el original?)
   - Limpieza (¿no quedó nada web-only?)

4. **Iterá** si pido cambios. Solo avanzá al siguiente componente cuando diga OK.

---

## Fase final — Stub de suscripciones

**Objetivo:** Dejar la estructura lista para fase 2 sin implementar nada.

```typescript
// hooks/useSubscription.ts

// TODO FASE 2: Implementar suscripciones con react-native-iap
// SKUs: 'impostor_monthly', 'impostor_annual'

export function useSubscription() {
  return {
    isPremium: false,
    subscribe: async (_sku: string) => {},
    restorePurchases: async () => {},
    subscriptions: [],
  };
}
```

Donde el juego original bloquea contenido premium, usar este hook. `isPremium = false` siempre → contenido premium bloqueado.

---

## Checklist final (después de todas las fases)

- [ ] La app arranca sin errores con `npx expo start --web`
- [ ] Todas las pantallas del juego están replicadas
- [ ] La lógica del juego funciona igual que en la PWA
- [ ] La API de Vercel responde correctamente
- [ ] No hay textos sueltos fuera de `<Text>`
- [ ] No hay imports de shadcn/ui ni librerías web-only
- [ ] No hay dependencias del DOM (window, document, localStorage sin reemplazar)
- [ ] No hay archivos innecesarios (service workers, Vite config, serverless functions)
- [ ] El hook useSubscription existe como stub
- [ ] Cada fase tiene su archivo en `migration-plan/`