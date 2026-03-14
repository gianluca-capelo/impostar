# Pendientes

## Protección contra abuso de la Edge Function generate-words

**Problema**: El `anon key` de Supabase es público (embebido en el bundle JS de la app). Cualquiera que lo extraiga puede llamar la Edge Function `generate-words` directamente, generando costos en Groq sin límite más allá del rate limit general de Supabase (~5000 req/min).

**Impacto**: Costos no controlados en la API de Groq.

**Opciones de mitigación**:
1. **Rate limiting por IP** dentro de la Edge Function (ej: máx 10 req/min por IP)
2. **Supabase Auth** — requerir login (anónimo o con email) para generar palabras
3. **Rate limiting por device ID** — guardar conteo en la DB por dispositivo

## Bug: Llamada a generateWordsFromDescription con argumentos incorrectos

**Archivo**: `app/index.tsx:79`

**Problema**: Se llama `generateWordsFromDescription(aiDescription, undefined, controller.signal)` con 3 argumentos, pero tras la migración a Supabase la función solo acepta 2: `(description, signal?)`. El `controller.signal` cae como tercer argumento y se ignora — el AbortSignal no se pasa, por lo que el timeout y la cancelación no funcionan.

**Fix**: Cambiar la llamada a `generateWordsFromDescription(aiDescription, controller.signal)`

## Bug: AbortSignal no se pasa a supabase.functions.invoke()

**Archivo**: `services/ai.ts`

**Problema**: Se crea un `AbortController` con timeout de 30s, pero nunca se pasa `controller.signal` a `supabase.functions.invoke()`. La llamada a la Edge Function no es cancelable.

## Publishable keys no soportan JWT en Edge Functions

**Problema**: Las publishable keys (`sb_publishable_xxx`) no funcionan con la verificación JWT por defecto de las Edge Functions. Para producción hay que deployar con `--no-verify-jwt` o implementar verificación custom dentro de la función.

**Impacto**: Sin verificación JWT, la función queda abierta a cualquiera que conozca la URL del proyecto de Supabase (relacionado con el punto de protección contra abuso).
