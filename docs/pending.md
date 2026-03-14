# Pendientes

## Protección contra abuso de la Edge Function generate-words

**Problema**: El `anon key` de Supabase es público (embebido en el bundle JS de la app). Cualquiera que lo extraiga puede llamar la Edge Function `generate-words` directamente, generando costos en Groq sin límite más allá del rate limit general de Supabase (~5000 req/min).

**Impacto**: Costos no controlados en la API de Groq.

**Opciones de mitigación**:
1. **Rate limiting por IP** dentro de la Edge Function (ej: máx 10 req/min por IP)
2. **Supabase Auth** — requerir login (anónimo o con email) para generar palabras
3. **Rate limiting por device ID** — guardar conteo en la DB por dispositivo

## Bug: Test suites ai.test.ts y GameSetup.test.tsx fallan al importar Supabase

**Archivos**: `__tests__/ai.test.ts`, `__tests__/GameSetup.test.tsx`

**Problema**: Ambas suites fallan antes de ejecutar tests porque importan `services/ai.ts` → `lib/supabase.ts`, que requiere `@react-native-async-storage/async-storage` (nativo, no mockeado en Jest) y las env vars `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (no definidas en el entorno de test).

**Fix**: Agregar un mock de `lib/supabase.ts` en la configuración de Jest (ej: `__mocks__/lib/supabase.ts` o en `jest.setup.js`) y definir las env vars en `jest.config.js`.

## Publishable keys no soportan JWT en Edge Functions

**Problema**: Las publishable keys (`sb_publishable_xxx`) no funcionan con la verificación JWT por defecto de las Edge Functions. Para producción hay que deployar con `--no-verify-jwt` o implementar verificación custom dentro de la función.

**Impacto**: Sin verificación JWT, la función queda abierta a cualquiera que conozca la URL del proyecto de Supabase (relacionado con el punto de protección contra abuso).
