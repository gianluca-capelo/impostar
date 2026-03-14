# Plan de seguridad: Edge Functions y autenticación

## 1. Plan de implementación

### Fase 1 — Anonymous Auth + verificación JWT manual

**Objetivo**: Proteger la Edge Function `generate-words` para que solo usuarios legítimos de la app puedan invocarla, sin requerir login ni datos personales.

#### 1.1 Activar Anonymous Auth en Supabase Dashboard

- Ir a **Authentication > Settings > Anonymous Sign-ins** y activarlo
- Opcionalmente activar CAPTCHA (Cloudflare Turnstile) en **Auth > Bot and Abuse Protection**

#### 1.2 Iniciar sesión anónima en el cliente

En `lib/supabase.ts` o en un nuevo archivo `lib/auth.ts`, crear una función que inicie sesión anónima si no hay sesión activa:

```typescript
import { supabase } from "./supabase";

export async function ensureAuthenticated(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("Error en autenticación anónima:", error.message);
    }
  }
}
```

Llamar `ensureAuthenticated()` al montar la app, idealmente en `_layout.tsx` o en `GameProvider`. La sesión se persiste automáticamente en AsyncStorage (ya configurado), por lo que solo se llama una vez por instalación.

#### 1.3 Verificar JWT en la Edge Function

Modificar `supabase/functions/generate-words/index.ts` para verificar el JWT manualmente usando `getClaims()`, siguiendo el patrón recomendado en la [documentación oficial](https://supabase.com/docs/guides/functions/auth):

```typescript
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseAuth = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SB_PUBLISHABLE_KEY")!
);

// Dentro de Deno.serve, antes de procesar el request:
const authHeader = req.headers.get("Authorization");
if (!authHeader) {
  return jsonResponse({ error: "No autorizado" }, 401);
}

const token = authHeader.replace("Bearer ", "");
const { data, error } = await supabaseAuth.auth.getClaims(token);
if (error || !data?.claims?.sub) {
  return jsonResponse({ error: "Token inválido" }, 401);
}

const userId = data.claims.sub; // UUID del usuario anónimo
```

#### 1.4 Exponer la publishable key como secret

```bash
supabase secrets set SB_PUBLISHABLE_KEY=sb_publishable_kL_XoTHX8QIRXcALqQPtGg_t5n0Vd0O
```

#### 1.5 Deployar con `--no-verify-jwt`

Dado que la verificación ahora es manual dentro de la función (como recomienda la documentación oficial para publishable keys), deployar con:

```bash
supabase functions deploy generate-words --no-verify-jwt
```

Esto no significa que la función quede desprotegida — la verificación con `getClaims()` reemplaza la verificación automática del gateway.

### Fase 2 — Rate limiting por usuario

#### 2.1 Opción A: Rate limiting en memoria (simple, sin dependencias externas)

Usar un `Map` en memoria dentro de la Edge Function. Limitación: se resetea al redeployar o si Supabase recicla la instancia. Suficiente como primera capa.

```typescript
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000; // 1 minuto

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}
```

#### 2.2 Opción B: Rate limiting con Upstash Redis (persistente, recomendado para producción)

Usar Upstash Redis (tiene free tier) con sliding window. Es el approach recomendado en los ejemplos oficiales de Supabase:

```typescript
import { Redis } from "https://deno.land/x/upstash_redis@v1.19.3/mod.ts";
import { Ratelimit } from "https://cdn.skypack.dev/@upstash/ratelimit@0.4.4";

const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 req por minuto
});

// En el handler, después de verificar JWT:
const { success } = await ratelimit.limit(userId);
if (!success) {
  return jsonResponse({ error: "Demasiadas solicitudes. Intenta en un momento." }, 429);
}
```

#### 2.3 CORS headers

Agregar manejo de CORS para requests desde web:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Al inicio del handler:
if (req.method === "OPTIONS") {
  return new Response("ok", { headers: corsHeaders });
}

// En jsonResponse, merge corsHeaders con los headers existentes.
```

---

## 2. Cómo resuelve los pendientes de `docs/pending.md`

### Pendiente 1: Protección contra abuso de la Edge Function `generate-words`

> **Problema**: El anon key es público. Cualquiera puede llamar la Edge Function directamente, generando costos en Groq sin límite.

**Resolución con este plan**:

| Capa | Protección | Cómo |
|------|-----------|------|
| Anonymous Auth | Bloquea requests sin sesión válida | `signInAnonymously()` en el cliente + `getClaims()` en la función |
| Rate limit de Supabase Auth | Limita creación de sesiones anónimas | 30 sign-ins por hora por IP (built-in de Supabase) |
| Rate limiting por user ID | Limita requests por usuario autenticado | 10 req/min por usuario (en-memoria o Upstash Redis) |
| CAPTCHA (opcional) | Bloquea bots que crean sesiones masivas | Cloudflare Turnstile en `signInAnonymously()` |

**Resultado**: Un atacante ya no puede simplemente extraer el anon key y hacer requests ilimitados. Necesitaría:
1. Crear una sesión anónima (limitado a 30/hora por IP)
2. Cada sesión solo puede hacer 10 requests por minuto
3. Costo máximo estimado por IP por hora: 30 usuarios × 10 req/min × 60 min = 18,000 requests — pero en la práctica el rate limit por usuario lo limita a ~600 req/hora por IP (30 sesiones × ~20 req antes de crear otra sesión)

Comparado con el estado actual (~5000 req/min sin límite = ~300,000 req/hora), es una reducción de ~99.8%.

### Pendiente 2: Publishable keys no soportan JWT en Edge Functions

> **Problema**: Las publishable keys no funcionan con la verificación JWT por defecto. Hay que deployar con `--no-verify-jwt` o implementar verificación custom.

**Resolución con este plan**:

Se implementa verificación manual con `getClaims()` dentro de la función, que es exactamente lo que la [documentación oficial recomienda](https://supabase.com/docs/guides/functions/auth) para publishable keys. Se deploya con `--no-verify-jwt` porque la verificación ahora vive dentro del código de la función, no en el gateway.

Esto es **más seguro** que la verificación del gateway porque:
- Permite inspeccionar claims específicos (ej: `is_anonymous`)
- Permite aplicar lógica de autorización customizada
- Permite extraer el `user.id` para rate limiting
- Es compatible con las JWT Signing Keys asimétricas nuevas de Supabase

---

## 3. Futuro: Sign in with Apple

### Objetivo

Reemplazar Anonymous Auth con Sign in with Apple como método principal de autenticación, para tener rate limiting permanente vinculado a la identidad real del usuario (Apple ID → App Store).

### Ventajas sobre Anonymous Auth

- **Persistencia real**: El usuario mantiene su identidad aunque cambie de dispositivo, borre la app, o limpie el storage
- **Rate limiting permanente**: El historial de uso se vincula al Apple ID, no a una sesión temporal
- **Confianza**: Apple verifica la identidad, eliminando la posibilidad de crear múltiples cuentas
- **Requisito de Apple**: Si en el futuro se agregan otros providers sociales, Apple requiere que Sign in with Apple esté disponible

### Compatibilidad con la implementación actual

La arquitectura de este plan está diseñada para que la migración sea gradual:

1. **El `user.id` se mantiene**: Supabase permite vincular un usuario anónimo a un Apple ID con `linkIdentity()`. El UUID del usuario no cambia, por lo que el rate limiting acumulado persiste.

2. **La Edge Function no cambia**: La verificación con `getClaims()` funciona igual para usuarios anónimos y autenticados con Apple. Solo cambia el claim `is_anonymous`.

3. **Se puede diferenciar**: En el futuro se puede dar rate limits más generosos a usuarios verificados con Apple vs anónimos:

```typescript
const isAnonymous = data.claims.is_anonymous === true;
const maxRequests = isAnonymous ? 10 : 30; // Más generoso para usuarios verificados
```

### Requisitos para implementar Sign in with Apple

- [ ] Apple Developer Account con App ID configurado con "Sign in with Apple" capability
- [ ] Service ID registrado en Apple Developer Portal
- [ ] Configurar provider "Apple" en Supabase Dashboard (Authentication > Providers)
- [ ] Instalar `expo-apple-authentication` en el proyecto
- [ ] Implementar flujo de login en la app (botón + manejo de sesión)
- [ ] Llamar `supabase.auth.signInWithIdToken({ provider: 'apple', token })` con el token de Apple
- [ ] Para usuarios existentes anónimos: `supabase.auth.linkIdentity({ provider: 'apple' })`
- [ ] UI de onboarding/login
- [ ] Manejar el caso de usuarios que rechazan el login (fallback a Anonymous Auth)
