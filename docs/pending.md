# Pendientes

## Protección contra abuso de la Edge Function generate-words

**Problema**: El `anon key` de Supabase es público (embebido en el bundle JS de la app). Cualquiera que lo extraiga puede llamar la Edge Function `generate-words` directamente, generando costos en Groq sin límite más allá del rate limit general de Supabase (~5000 req/min).

**Impacto**: Costos no controlados en la API de Groq.

**Opciones de mitigación**:
1. **Rate limiting por IP** dentro de la Edge Function (ej: máx 10 req/min por IP)
2. **Supabase Auth** — requerir login (anónimo o con email) para generar palabras
3. **Rate limiting por device ID** — guardar conteo en la DB por dispositivo
