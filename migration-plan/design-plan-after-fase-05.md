# Plan de mejoras estéticas — Post Fase 5

## Contexto

La Fase 5 dejó la pantalla GameSetup funcional pero con un estilo básico. Este plan aborda 3 mejoras estéticas puntuales para elevar la calidad visual antes de continuar con las fases siguientes.

---

## 1. Título "IMPOSTAR" — Gradiente en "AR"

**Problema:** Actualmente "AR" es un color plano `#7dd3fc`. En la PWA original usa un gradiente vertical `from-sky-300 via-white to-sky-300` con `bg-clip-text` que le da un efecto brillante/metálico.

**Solución:** Usar `expo-linear-gradient` + `@react-native-masked-view/masked-view` para renderizar un gradiente real sobre el texto "AR".

```
npx expo install expo-linear-gradient @react-native-masked-view/masked-view
```

**Implementación en `components/GameTitle.tsx`:**
```tsx
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

// "AR" como MaskedView con gradiente vertical sky-300 → white → sky-300
<MaskedView maskElement={<Text style={arStyle}>AR</Text>}>
  <LinearGradient colors={["#7dd3fc", "#ffffff", "#7dd3fc"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
    <Text style={[arStyle, { opacity: 0 }]}>AR</Text>
  </LinearGradient>
</MaskedView>
```

**Nota:** MaskedView tiene problemas conocidos en Android (issue #32934 de Expo). Agregar fallback a color plano `#7dd3fc` en Android con `Platform.OS`.

**Archivos:** `components/GameTitle.tsx`

---

## 2. Cambiar accent de violeta a celeste

**Problema:** El accent actual es violeta `#7c3aed`. El usuario quiere un celeste que combine con el título (sky/cyan).

**Propuesta de color:** `#38bdf8` (sky-400 de Tailwind) — celeste vibrante que armoniza con el `#7dd3fc` del título.

**Archivos a modificar:**

| Archivo | Cambio |
|---------|--------|
| `tailwind.config.js` | `accent: "#7c3aed"` → `accent: "#38bdf8"` |
| `components/AiPremiumCard.tsx` | `text-purple-400` → `text-sky-400`, `#c084fc` → `#38bdf8` |
| `components/CategoryPicker.tsx` | `color="#7c3aed"` (checkmark) → `color="#38bdf8"` |
| `components/PlayerConfig.tsx` | `color="#7c3aed"` (icono impostores) → `color="#38bdf8"`, `trackColor true: "#7c3aed"` → `"#38bdf8"` |

El botón "¡Comenzar partida!" (`bg-accent`) y todos los demás usos de `accent` se actualizan automáticamente por Tailwind.

---

## 3. Tamaños de fuente — Revisión según guías iOS

**Referencia Apple HIG (Dynamic Type scale):**
- Large Title: **34pt**
- Title 1: 28pt
- Body (estándar): **17pt**
- Callout: 16pt
- Subhead: 15pt
- Footnote: 13pt
- Caption: 12pt
- Mínimo legible: 11pt (tab bar: 10pt)

**Escala NativeWind actual vs. recomendaciones iOS:**

| Clase | Tamaño | Uso actual | Recomendación iOS |
|-------|--------|------------|-------------------|
| `text-6xl` | 60px | Título "IMPOSTAR" | 34pt es Large Title. 60px es correcto para un logo/marca, no para texto de lectura. **OK — es branding, no contenido.** |
| `text-xl` | 20px | "Generar con IA", botón Comenzar | Bien para títulos de sección / botones primarios |
| `text-lg` | 18px | Inputs, subtítulo | Cercano a body (17pt). **OK** |
| `text-base` | 16px | Labels, items de picker | Callout (16pt). **OK** |
| `text-sm` | 14px | Textos secundarios, hints | Subhead (15pt). **Ligeramente chico — subir a `text-[15px]` o dejar** |
| `text-xs` | 12px | Captions ("3-12", "Máx. N"), badge PREMIUM | Caption (12pt). **OK** |

**Diagnóstico:** Los tamaños actuales están razonablemente alineados con iOS HIG. El título `text-6xl` (60px) es adecuado para branding/logo — Apple usa 34pt para Large Title pero eso es para contenido navegable, no para nombres de app.

**Ajuste sugerido:** Subir `text-sm` (14px) a `text-[15px]` en textos secundarios que el usuario necesita leer (hints de validación, descripciones). Mantener `text-xs` (12px) para captions cortas.

**Archivos a modificar:**
- `app/index.tsx` — textos de separadores y hints
- `components/AiPremiumCard.tsx` — descripción
- `components/PlayerConfig.tsx` — hints de rango y texto de nombres

---

## Resumen de cambios

| # | Cambio | Deps nuevas | Archivos |
|---|--------|-------------|----------|
| 1 | Gradiente en "AR" | `expo-linear-gradient`, `@react-native-masked-view/masked-view` | `GameTitle.tsx` |
| 2 | Accent violeta → celeste | — | `tailwind.config.js`, `AiPremiumCard.tsx`, `CategoryPicker.tsx`, `PlayerConfig.tsx` |
| 3 | Ajuste text-sm → 15px | — | `index.tsx`, `AiPremiumCard.tsx`, `PlayerConfig.tsx` |

## Verificación

1. Abrir la app → el título "AR" muestra gradiente sky→white→sky (iOS) o color plano celeste (Android fallback)
2. Botón "Comenzar partida" es celeste, no violeta
3. Switch, checkmarks e íconos de accent son celeste
4. Textos secundarios son legibles sin forzar la vista
5. `npx jest` → todos los tests siguen pasando
