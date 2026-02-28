# Fase 1 — Scaffolding

## Qué se hizo

1. **Limpieza**: Borrado de `node_modules/` residuales de la rama anterior
2. **Inicialización Expo**: Proyecto creado con `create-expo-app --template blank-typescript`
3. **Dependencias instaladas**:
   - `expo ~55.0.4`, `react ^19.2.0`, `react-native 0.83.2`
   - `expo-router ~55.0.3` (navegación)
   - `nativewind ^4.2.2` + `tailwindcss ^3.4.19` (estilos)
   - `@react-native-async-storage/async-storage 2.2.0` (persistencia)
   - `@expo/vector-icons ^15.0.2` (iconos)
   - `react-native-safe-area-context`, `react-native-screens` (navegación nativa)
   - `react-native-web`, `react-dom`, `@expo/metro-runtime` (soporte web para testing)

4. **Configuración NativeWind v4**:
   - `babel.config.js` — preset nativewind + jsxImportSource
   - `metro.config.js` — withNativeWind wrapper
   - `tailwind.config.js` — tema oscuro custom con colores del juego
   - `global.css` — directivas Tailwind
   - `nativewind-env.d.ts` — tipos TypeScript

5. **Configuración Expo Router**:
   - `app/_layout.tsx` — layout raíz con SafeAreaProvider, StatusBar light, Stack sin header
   - `app/index.tsx` — pantalla placeholder con NativeWind
   - `index.ts` — entry point apuntando a expo-router

6. **Configuración del proyecto**:
   - `app.json` — nombre "Impostar", tema oscuro, bundleIdentifier iOS, scheme para deep links
   - `tsconfig.json` — strict mode, path aliases con `@/`
   - `package.json` — nombre corregido a "impostar"

7. **Estructura de carpetas** creada:
   ```
   app/          → pantallas (Expo Router)
   components/   → componentes UI
   hooks/        → hooks custom
   context/      → contextos React
   services/     → llamadas a API
   types/        → tipos TypeScript
   migration-plan/ → documentación de cada fase
   ```

## Colores del tema

| Token | Hex | Uso |
|-------|-----|-----|
| background | #0a0a0a | Fondo principal |
| surface | #1a1a2e | Tarjetas, superficies |
| primary | #e2e8f0 | Texto principal |
| secondary | #94a3b8 | Texto secundario |
| accent | #7c3aed | Acentos, botones |
| impostor | #ef4444 | Color impostor |
| civil | #22c55e | Color civil |
| border | #2d2d44 | Bordes |
