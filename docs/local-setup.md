# Guía: Correr Supabase Edge Functions localmente

## Prerequisitos

- **Docker Desktop** instalado y abierto
- **Supabase CLI** (ya incluido en devDependencies)
- **`supabase/functions/.env`** con `GROQ_API_KEY=<tu-key>`

## Pasos

### Paso 1: Levantar el stack local de Supabase

```bash
npx supabase start -x vector
```

- Levanta: PostgreSQL, Auth, Storage, Edge Runtime, Studio, etc.
- `-x vector` excluye el servicio de logging que falla con Docker Desktop en Linux
- Primera vez descarga imágenes Docker (~2-3 min). Las siguientes es más rápido
- Al terminar muestra URLs y keys locales

### Paso 2: Servir la Edge Function

En **otra terminal**:

```bash
npx supabase functions serve generate-words --env-file supabase/functions/.env --no-verify-jwt
```

- Levanta la función en `http://localhost:54321/functions/v1/generate-words`
- `--no-verify-jwt` es necesario porque las publishable keys (`sb_publishable_xxx`) no soportan verificación JWT en Edge Functions
- Hot reload habilitado: al guardar cambios se recarga automáticamente

### Paso 3: Probar con curl

En **otra terminal**:

```bash
curl -X POST http://localhost:54321/functions/v1/generate-words \
  -H "Content-Type: application/json" \
  -d '{"description": "Frutas"}'
```

Respuesta esperada:

```json
{ "words": ["Manzana", "Banana", "Naranja", "Pera", "Uva", ...] }
```

### Paso 4: Parar cuando termines

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
