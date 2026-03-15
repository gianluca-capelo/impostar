#!/bin/bash
set -euo pipefail

# 1. Verificar Docker
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker no está corriendo. Abre Docker Desktop primero."
  exit 1
fi

# 2. Levantar Supabase (si no está corriendo)
if ! npx supabase status > /dev/null 2>&1; then
  echo "Levantando Supabase..."
  npx supabase start -x vector
else
  echo "Supabase ya está corriendo."
fi

# 3. Generar .env.local (solo si no existe)
if [ ! -f .env.local ]; then
  echo "Generando .env.local..."
  eval "$(npx supabase status -o env)"

  # Usar IP local en vez de 127.0.0.1 para que funcione desde el celular vía Expo Go
  LOCAL_IP=$(hostname -I | awk '{print $1}')
  SUPABASE_URL="http://${LOCAL_IP}:54321"

  cat > .env.local << EOF
EXPO_PUBLIC_SUPABASE_URL=$SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
EOF
  echo ".env.local creado (usando IP local: $LOCAL_IP)."
else
  echo ".env.local ya existe, saltando."
fi

# 4. Servir Edge Function (foreground — Ctrl+C para parar)
echo "Sirviendo Edge Function generate-words..."
npx supabase functions serve generate-words --env-file supabase/functions/.env --no-verify-jwt
