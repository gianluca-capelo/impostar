# Deploy a TestFlight — Guía paso a paso

## Prerequisitos

- Cuenta de Apple Developer activa ($99/año)
- Node.js instalado
- Edge Function `generate-words` deployada en Supabase ✅

---

## Paso 1: Crear la app en App Store Connect

1. Ir a [App Store Connect](https://appstoreconnect.apple.com/) → Apps → botón "+"
2. Completar:
   - **Nombre**: Impostar
   - **Idioma principal**: Español
   - **Bundle ID**: `app.impostar.ios`
   - **SKU**: `impostar`
3. Anotar el **Apple ID** que aparece en App Information → General Information (se necesita para EAS Submit)

---

## Paso 2: Instalar EAS CLI e iniciar sesión

```bash
npm install -g eas-cli
eas login
eas whoami   # verificar que estés logueado
```

Docs: https://docs.expo.dev/eas/cli/#installation

---

## Paso 3: Configurar EAS en el proyecto

```bash
eas build:configure
```

Esto genera `eas.json`. Editarlo con esta configuración:

```json
{
  "cli": {
    "version": ">= 15.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "environment": "development",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "environment": "preview"
    },
    "production": {
      "environment": "production",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "TU_ASC_APP_ID_AQUI"
      }
    }
  }
}
```

> Reemplazar `TU_ASC_APP_ID_AQUI` con el Apple ID del Paso 1.

Docs: https://docs.expo.dev/build/eas-json/

---

## Paso 4: Configurar variables de entorno

```bash
eas env:create \
  --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://jdtyebvkthurbrmbdcpt.supabase.co" \
  --environment production \
  --visibility plaintext

eas env:create \
  --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "TU_ANON_KEY" \
  --environment production \
  --visibility plaintext
```

> `EXPO_PUBLIC_` vars se embeben en el bundle del cliente. Usar `plaintext` o `sensitive` (no `secret`).

Docs: https://docs.expo.dev/eas/environment-variables/

---

## Paso 5: Build para iOS

```bash
eas build --platform ios --profile production
```

En el primer build, EAS:
1. Pide login de Apple Developer account
2. Genera Distribution Certificate automáticamente
3. Genera Provisioning Profile automáticamente
4. Sube el proyecto a los servidores de EAS Build
5. Genera el `.ipa`

El build tarda ~10-20 minutos. Monitorear en https://expo.dev

Docs: https://docs.expo.dev/build/introduction/

---

## Paso 6: Submit a TestFlight

```bash
eas submit --platform ios
```

O build + submit en un solo comando:

```bash
eas build --platform ios --profile production --auto-submit
```

El build aparece en TestFlight después de que Apple lo procese (~10-15 minutos).

Docs: https://docs.expo.dev/submit/ios/

---

## Paso 7: Agregar testers en TestFlight

En [App Store Connect](https://appstoreconnect.apple.com/):

1. Ir a tu app → pestaña **TestFlight**
2. **Internal Testing** → "+" → crear grupo
3. Agregar testers por email (necesitan Apple ID) — hasta 100 testers internos
4. Los testers reciben invitación por email para instalar TestFlight y la app

> Los builds internos están disponibles **inmediatamente** (no requieren Beta App Review).

---

## Certificados y provisioning profiles

EAS maneja todo automáticamente con **managed credentials**. No necesitás crear certificados manualmente en el Apple Developer Portal.

Para gestionar credenciales:
```bash
eas credentials
```

Docs: https://docs.expo.dev/app-signing/managed-credentials/

---

## Resumen de comandos

```bash
# Setup (una sola vez)
npm install -g eas-cli
eas login
eas build:configure

# Env vars (una sola vez)
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "..." --environment production --visibility plaintext
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "..." --environment production --visibility plaintext

# Build + deploy (cada vez que quieras subir)
eas build --platform ios --profile production --auto-submit
```

## Links de referencia

| Tema | URL |
|------|-----|
| EAS Build | https://docs.expo.dev/build/introduction/ |
| Primer build | https://docs.expo.dev/build/setup/ |
| eas.json | https://docs.expo.dev/build/eas-json/ |
| Variables de entorno | https://docs.expo.dev/eas/environment-variables/ |
| Managed credentials | https://docs.expo.dev/app-signing/managed-credentials/ |
| EAS Submit (iOS) | https://docs.expo.dev/submit/ios/ |
| Tutorial iOS production | https://docs.expo.dev/tutorial/eas/ios-production-build/ |
