# Guía: Correr Supabase Edge Functions localmente

## Prerequisitos

- **Docker Desktop** instalado y abierto
- **Supabase CLI** (ya incluido en devDependencies)
- **`supabase/functions/.env`** con `GROQ_API_KEY=<tu-key>`

## Setup rápido

```bash
# 1. Levantar Supabase + generar .env.local + servir Edge Function
npm run dev:local

# 2. En otra terminal, levantar la app
npx expo start
```

`dev:local` hace lo siguiente automáticamente:
1. Levanta el stack de Supabase (`supabase start -x vector`) si no está corriendo
2. Genera `.env.local` con la IP local de tu máquina (para que funcione desde Expo Go en el celular) y las keys locales, si no existe
3. Sirve la Edge Function `generate-words` con hot reload

Ctrl+C para parar la Edge Function. Para parar Supabase: `npx supabase stop`.

## Pasos manuales (referencia)

Si prefieres correr cada paso por separado:

### Paso 1: Levantar el stack local de Supabase

```bash
npx supabase start -x vector
```

- Levanta: PostgreSQL, Auth, Storage, Edge Runtime, Studio, etc.
- `-x vector` excluye el servicio de logging que falla con Docker Desktop en Linux
- Primera vez descarga imágenes Docker (~2-3 min). Las siguientes es más rápido
- Al terminar muestra URLs y keys locales

### Paso 2: Crear `.env.local`

Copiar la `anon key` de la salida del paso 1 y usar la **IP local** de tu máquina (no `127.0.0.1`, para que funcione desde Expo Go en el celular):

```bash
# Obtener tu IP local
hostname -I | awk '{print $1}'
```

```bash
# .env.local (en la raíz del proyecto, NO commitear)
EXPO_PUBLIC_SUPABASE_URL=http://<tu-ip-local>:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key-que-muestra-supabase-start>
```

> **Importante:** Usar `127.0.0.1` solo funciona en el navegador. Para Expo Go en el celular, se necesita la IP de tu máquina en la red local.

Expo le da prioridad a `.env.local` sobre `.env`, así que la app usará el stack local automáticamente.

### Paso 3: Servir la Edge Function

En **otra terminal**:

```bash
npx supabase functions serve generate-words --env-file supabase/functions/.env --no-verify-jwt
```

- Levanta la función en `http://localhost:54321/functions/v1/generate-words`
- `--no-verify-jwt` es necesario porque las publishable keys no soportan verificación JWT en Edge Functions
- Hot reload habilitado: al guardar cambios se recarga automáticamente

### Paso 4: Probar con curl

```bash
curl -X POST http://localhost:54321/functions/v1/generate-words \
  -H "Content-Type: application/json" \
  -d '{"description": "Frutas"}'
```

Respuesta esperada:

```json
{ "words": ["Manzana", "Banana", "Naranja", "Pera", "Uva", ...] }
```

### Paso 5: Levantar la app con Expo

En **otra terminal**:

```bash
npx expo start
```

### Paso 6: Parar cuando termines

```bash
# Ctrl+C en la terminal de functions serve
npx supabase stop
```

## Troubleshooting

| Error | Solución |
|-------|----------|
| `Cannot connect to the Docker daemon` | Abrir Docker Desktop |
| `container name is already in use` | `docker rm -f <nombre-del-contenedor>`, luego `npx supabase stop` + `npx supabase start -x vector` |
| `supabase start is not running` | Correr paso 1 antes del paso 2 |
| `supabase_vector_impostar container is not ready: unhealthy` | Usar `-x vector` en `supabase start` |
| `Missing auth header` | Usar `--no-verify-jwt` en `functions serve` |
| `Failed to send a request to the Edge Function` (desde celular) | Usar la IP local de tu máquina en `.env.local` en vez de `127.0.0.1`. Borrar `.env.local` y correr `npm run dev:local` de nuevo |
