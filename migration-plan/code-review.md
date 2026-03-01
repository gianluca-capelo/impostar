# Code Review — Branch `migration`

**Fecha:** 2026-03-01
**Branch:** `migration` vs `main`
**Stack:** Expo 54 · React Native 0.81.5 · React 19 · TypeScript 5.9 · NativeWind 4.2
**Commits analizados:** 13 commits (Fase 1 → Fase 9 + fixes + merge de main)

---

## Resumen ejecutivo

La migración está bien estructurada y el código es de buena calidad en general. Se encontraron **6 bugs críticos** que deben corregirse antes de un release, **5 problemas de severidad media** y **3 observaciones menores**.

> **Nota:** La revisión inicial identificó correctamente 9 issues (C-1 a B-2). Una segunda pasada de verificación confirmó todos ellos y encontró 6 issues adicionales (N-C1 a N-B2) detallados al final del documento.

---

## 🔴 Críticos (corregir antes de release)

### C-1 · Race condition en el botón "Iniciar Juego"

**Archivo:** [app/index.tsx](../app/index.tsx)
**Función:** `handleStartGame`

`handleStartGame` es `async` (llama a `startGame` que escribe en AsyncStorage y puede hacer fetch al API de IA), pero el botón que la invoca **no se deshabilita** durante la ejecución. Si el usuario toca el botón dos veces rápido, o si hay latencia de red, se lanzan múltiples llamadas concurrentes a `startGame()` seguidas de múltiples `router.push("/roles")`, corrompiendo el estado del juego.

**Fix recomendado:**
```typescript
const [isStarting, setIsStarting] = useState(false);

const handleStartGame = async () => {
  if (isStarting) return;
  const error = validateGameSetup({ ... });
  if (error) { Alert.alert(...); return; }
  try {
    setIsStarting(true);
    await startGame(players, impostors, names, category, customWord);
    router.push("/roles");
  } finally {
    setIsStarting(false);
  }
};

// En el botón:
// disabled={isStarting}
```

---

### C-2 · `startNewRoundSameCategory` llamada sin await ni try-catch

**Archivo:** [app/roles.tsx](../app/roles.tsx) — `onPress` del botón "Nueva ronda (misma categoría)"

`startNewRoundSameCategory` es una función `async` que consulta AsyncStorage mediante `getAvailableWords`. Al pasarse directamente como `onPress`, React Native la llama pero **ignora la Promise resultante**: cualquier error lanzado dentro de la función desaparece silenciosamente.

**Fix recomendado:**
```typescript
const handleNewRoundSameCategory = async () => {
  try {
    await startNewRoundSameCategory();
  } catch (e) {
    Alert.alert("Error", "No se pudo iniciar la nueva ronda. Intenta de nuevo.");
  }
};

// En el botón:
// onPress={handleNewRoundSameCategory}
```

---

### C-3 · Sin timeout en el fetch al API de IA

**Archivo:** [services/ai.ts](../services/ai.ts) — línea ~23

```typescript
const response = await fetch("https://impostar.app/api/generate-words", { ... });
```

El fetch no tiene timeout. Si el servidor no responde (caída, red lenta, roaming), la llamada puede quedar colgada **indefinidamente**, bloqueando el spinner de generación sin dar feedback al usuario ni posibilidad de cancelar.

**Fix recomendado:**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30_000);

try {
  const response = await fetch("https://impostar.app/api/generate-words", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, subscriptionToken }),
    signal: controller.signal,
  });
  // ...
} finally {
  clearTimeout(timeoutId);
}
```

Capturar también `AbortError` para mostrar un mensaje específico de timeout al usuario.

---

## 🟡 Medios (corregir antes de v1.0 estable)

### M-1 · Palabras generadas por IA no se persisten

**Archivo:** [context/GameContext.tsx](../context/GameContext.tsx) — línea ~48

```typescript
const [aiGeneratedWords, setAiGeneratedWords] = useState<string[]>([]);
```

Las palabras generadas viven solo en memoria. Si el usuario genera palabras, minimiza la app un tiempo y el sistema la termina en background, **pierde todas sus palabras al volver** y debe regenerarlas (con coste de una llamada al API).

El historial de palabras usadas ya se persiste en AsyncStorage vía `services/wordHistory.ts`. `aiGeneratedWords` debería seguir el mismo patrón.

**Fix recomendado:** Crear `services/aiWords.ts` con `saveAiWords` / `loadAiWords` y cargarlas en el `useEffect` inicial de `GameContext`.

---

### M-2 · URL del API hardcodeada

**Archivo:** [services/ai.ts](../services/ai.ts) — línea ~23

```typescript
const response = await fetch("https://impostar.app/api/generate-words", {
```

No hay forma de apuntar a un entorno de staging sin recompilar la app. Esto también dificulta las pruebas locales.

**Fix recomendado:** Extraer a un archivo de configuración:
```typescript
// config.ts
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://impostar.app";

// services/ai.ts
import { API_BASE_URL } from "@/config";
const response = await fetch(`${API_BASE_URL}/api/generate-words`, { ... });
```

Las variables `EXPO_PUBLIC_*` se resuelven en build time y son la forma estándar de Expo para esto.

---

### M-3 · Fallback de categoría inconsistente cuando no hay palabras IA

**Archivo:** [context/GameContext.tsx](../context/GameContext.tsx) — función `startGame`, ~líneas 196-225

Cuando el usuario seleccionó `ia_generado` pero `aiGeneratedWords` está vacío, el código muestra un `Alert` ("No hay palabras generadas. Usando palabra aleatoria.") y aun así **inicia el juego** con `getRandomWordFromAllCategories()`:

```typescript
if (noAiWordsAvailable) {
  Alert.alert("Error", "No hay palabras generadas. Usando palabra aleatoria.");
  const result = await getRandomWordFromAllCategories(); // ← retorna { word, category: "comida" }
  await addUsedWord(fallbackCategory, fallbackWord);    // ← historial con fallbackCategory correcto
  setGameState({ ..., category }); // ← category sigue siendo "ia_generado" ← BUG
}
```

**Tres problemas acumulados:** (1) el juego arranca con una categoría incorrecta; (2) `gameState.category` queda como `"ia_generado"` aunque la palabra sea de `"comida"`; (3) hay una **doble inconsistencia**: el historial (`addUsedWord`) registra la palabra bajo `fallbackCategory` correctamente, pero `gameState` muestra `"ia_generado"`, corrompiendo cualquier lógica que lea `gameState.category` para saber qué categoría se está jugando.

**Fix recomendado:** En lugar de avisar y continuar, **no iniciar el juego** y devolver al usuario al form de generación con un mensaje claro ("Genera palabras antes de iniciar."). Si se decide mantener el fallback, el fix mínimo es `category: fallbackCategory` en el `setGameState`.

---

### M-4 · Mensajes de error genéricos desde el API

**Archivo:** [services/ai.ts](../services/ai.ts) — bloque `catch`

```typescript
// Cuando !response.ok y el JSON parse falla:
catch {
  throw new Error("Error al generar palabras"); // ← genérico
}

// Cuando fetch() lanza (error de red, TypeError): no hay catch → el error
// llega sin capturar al componente que llama, sin mensaje para el usuario.
```

La función tiene tres caminos de error problemáticos: (a) errores de red (`fetch()` falla) llegan como `TypeError` sin capturar hasta el caller; (b) JSON malformado cuando `!ok` produce el mensaje genérico "Error al generar palabras"; (c) no hay timeout (ver C-3), por lo que un hang tampoco produciría mensaje.

**Agravante:** el caller en `roles.tsx` tampoco tiene try-catch (ver C-2 / N-C2), así que la cadena completa `ai.ts → GameContext → roles.tsx → usuario` no tiene ningún punto de captura de errores. El error desaparece silenciosamente en todos los casos excepto `SUBSCRIPTION_REQUIRED`.

`SUBSCRIPTION_REQUIRED` sí está bien manejado. Y JSON malformado en respuesta exitosa tiene su propio mensaje ("Respuesta inválida del servidor").

**Fix recomendado:** Capturar explícitamente en el caller o en `ai.ts`:
- `AbortError` → "La generación tardó demasiado. Verifica tu conexión."
- `TypeError` (network) → "Sin conexión a internet."
- Error HTTP del servidor → usar el `errorCode` que ya existe en la respuesta.

---

## 🟠 Baja severidad

### B-1 · `useEffect` con ejecución innecesaria en `roles.tsx`

**Archivo:** [app/roles.tsx](../app/roles.tsx) — ~líneas 29-34

```typescript
useEffect(() => {
  if (gameState.currentPlayerIndex === 0 && gameState.phase === "roles") {
    setIsRoleVisible(false);
  }
}, [gameState.currentPlayerIndex, gameState.phase]);
```

El efecto se ejecuta **cada vez que cambia el índice** (incluso cuando el índice no es 0), evaluando la condición sin efecto útil. No causa bugs, pero es una ejecución redundante en cada avance de jugador.

**Fix sugerido:** La lógica puede simplificarse a un reset al montar el componente o al entrar en fase `"roles"`, sin depender del índice.

---

### B-2 · Sin debounce al persistir la configuración del juego

**Archivo:** [hooks/useGameSetup.ts](../hooks/useGameSetup.ts) — líneas 26-30

```typescript
useEffect(() => {
  if (isLoadedRef.current) {
    saveSetup(setup); // ← AsyncStorage write sin debounce
  }
}, [setup]);
```

Cada carácter escrito en los campos de nombres de jugadores dispara una escritura a AsyncStorage. En un dispositivo lento o con nombres largos, esto genera múltiples escrituras seguidas innecesarias.

**Fix sugerido:** Agregar debounce de ~300ms con `useRef` + `clearTimeout`:
```typescript
const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  if (!isLoadedRef.current) return;
  if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
  saveTimeoutRef.current = setTimeout(() => saveSetup(setup), 300);
  return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
}, [setup]);
```

---

---

## 🔴 Críticos adicionales (segunda pasada)

### N-C1 · `gameState.category` incorrecto en el fallback de M-3

**Archivo:** [context/GameContext.tsx](../context/GameContext.tsx) — `startGame`, bloque fallback

Este es un bug más específico que M-3. En el `setGameState` del bloque fallback, la categoría no se corrige:

```typescript
setGameState({
  secretWord: fallbackWord,      // ← "pizza" (viene de "comida")
  category,                       // ← sigue siendo "ia_generado" ← BUG
  // ...
});
```

Cualquier código que lea `gameState.category` para determinar categoría actual (UI, lógica de ronda, `startNewRoundSameCategory`) recibirá el valor incorrecto. Fix mínimo: `category: fallbackCategory`.

---

### N-C2 · `startGame` y `startNewRoundSameCategory` sin try-catch propios

**Archivo:** [context/GameContext.tsx](../context/GameContext.tsx)

Ambas funciones realizan múltiples operaciones async (`selectSecretWord`, `addUsedWord`) sin ningún bloque try-catch:

```typescript
// startGame — sin try-catch
const result = await selectSecretWord(category, aiGeneratedWords);
await addUsedWord(category, result.word); // si lanza → unhandled rejection
setGameState({ ... });

// startNewRoundSameCategory — sin try-catch
const result = await selectSecretWord(...);
await addUsedWord(...); // si lanza → unhandled rejection silencioso
```

Combinado con C-2 (el caller en `roles.tsx` tampoco tiene catch), cualquier error queda completamente invisible para el usuario.

**Fix recomendado:** Envolver la lógica async de ambas funciones en try-catch y propagar errores con mensajes útiles, o manejarlos con un callback de `onError`.

---

### N-C3 · Botón "Resetear" sin loading state

**Archivo:** [app/index.tsx](../app/index.tsx) — `handleReset`

`handleReset` es async (llama a `resetAllData()` y `clearSetup()`) pero el botón no tiene `disabled` ni loading state durante la ejecución. Mismo patrón que C-1: el usuario puede disparar múltiples resets concurrentes.

```typescript
const handleReset = async () => {
  await resetAllData();
  await clearSetup();
  // ... setState calls
};
// botón sin disabled={isResetting}
```

**Fix recomendado:** Idéntico a C-1 — agregar `isResetting` state y deshabilitar el botón mientras se ejecuta.

---

## 🟡 Medios adicionales (segunda pasada)

### N-M1 · Sin AbortController: memory leak al desmontar durante generación IA

**Archivos:** [services/ai.ts](../services/ai.ts) · [context/GameContext.tsx](../context/GameContext.tsx)

Si el usuario navega fuera de la pantalla mientras `generateWordsFromDescription` está en vuelo, el fetch continúa en background. Al resolver, intenta llamar a `setAiGeneratedWords` sobre un componente ya desmontado:

```typescript
// ai.ts — sin signal:
const response = await fetch("https://impostar.app/api/generate-words", { ... });
// GameContext — sin cleanup al desmontar:
const words = await generateWordsFromDescription(aiDescription);
setAiGeneratedWords(words); // ← puede ocurrir después de unmount
```

Resultado: warning de React + potencial memory leak. (Esto también agrava C-3, ya que sin AbortController no hay forma de cancelar un fetch colgado).

**Fix recomendado:** Pasar un `AbortSignal` desde el caller hasta el fetch, y en el componente crear un `useEffect` con cleanup que llame a `controller.abort()` al desmontar.

---

### N-M2 · Sin validación del shape de la respuesta del API

**Archivo:** [services/ai.ts](../services/ai.ts) — líneas ~47-51

```typescript
let data: GenerateWordsResponse;
try {
  data = await response.json();
} catch {
  throw new Error("Respuesta inválida del servidor");
}
return data.words; // ← asume que words es string[]
```

El cast TypeScript `let data: GenerateWordsResponse` no valida en runtime. Si la API devuelve `{ words: null }`, `{ words: "texto" }` o incluso `{}`, la función retorna el valor inválido sin error. Ese valor llega a `setAiGeneratedWords` y puede romper cualquier código que itere sobre `aiGeneratedWords`.

**Fix recomendado:** Validar el shape en runtime antes de retornar:
```typescript
if (!Array.isArray(data.words)) {
  throw new Error("Respuesta inválida del servidor");
}
return data.words;
```

---

## 🟠 Bajos adicionales (segunda pasada)

### N-B1 · Índice de array como `key` en listas

**Archivos:**
- [components/AiGenerationForm.tsx](../components/AiGenerationForm.tsx) — línea ~106
- [components/PlayerConfig.tsx](../components/PlayerConfig.tsx) — línea ~89

```typescript
// AiGenerationForm.tsx
{generatedWords.map((word, index) => (
  <View key={index} ...>  // ← índice como key
))}

// PlayerConfig.tsx
{playerNames.map((name, i) => (
  <TextInput key={i} ...> // ← índice como key
))}
```

Usar el índice del array como key hace que React no pueda distinguir elementos cuando la lista cambia de longitud o se reordena. En `PlayerConfig`, esto puede causar bugs sutiles en el estado del TextInput (texto asignado al campo equivocado). En `AiGenerationForm` es menos crítico porque la lista solo crece.

**Fix recomendado:** Para `generatedWords` usar el propio string como key (son únicos por diseño). Para `playerNames`, generarlos con un id estable al crear cada jugador.

---

## ✅ Puntos positivos

| Aspecto | Detalle |
|---|---|
| Patrón `useRef` para carga inicial | `isLoadedRef` en `useGameSetup` evita sobrescribir AsyncStorage antes de leer |
| Normalización de palabras | Lowercase + trim antes de guardar en historial previene duplicados |
| Stub de `useSubscription` | Flag `DEV_PREMIUM` permite probar pantallas premium sin suscripción real |
| TypeScript strict mode | Activado en `tsconfig.json`, captura errores de tipos en compile time |
| AsyncStorage reemplaza localStorage | Migración correcta de persistencia web → nativa |
| Cobertura de tests | ~2000 líneas de tests con mocks correctos de AsyncStorage y Context |
| Contenido localizado | Categorías específicas de Argentina (Personajes AR, Lugares AR) bien curadas |
| Dark mode forzado | `"userInterfaceStyle": "dark"` en `app.json` garantiza consistencia visual |

---

## Priorización de fixes

| # | Issue | Severidad | Esfuerzo estimado |
|---|---|---|---|
| C-1 | Loading state en startGame | 🔴 Crítico | ~15 min |
| C-2 | Await + try-catch en startNewRoundSameCategory | 🔴 Crítico | ~10 min |
| C-3 | Timeout en fetch de IA | 🔴 Crítico | ~20 min |
| N-C1 | `category: fallbackCategory` en setGameState del fallback | 🔴 Crítico | ~5 min |
| N-C2 | Try-catch en startGame y startNewRoundSameCategory | 🔴 Crítico | ~20 min |
| N-C3 | Loading state en botón Resetear | 🔴 Crítico | ~10 min |
| M-3 | Fallback honesto cuando no hay palabras IA | 🟡 Medio | ~15 min |
| M-4 | Mensajes de error diferenciados | 🟡 Medio | ~30 min |
| N-M1 | AbortController para cancelar fetch al desmontar | 🟡 Medio | ~30 min |
| N-M2 | Validar shape de respuesta del API | 🟡 Medio | ~10 min |
| M-1 | Persistir aiGeneratedWords | 🟡 Medio | ~45 min |
| M-2 | URL del API configurable | 🟡 Medio | ~20 min |
| B-1 | Optimizar useEffect en roles.tsx | 🟠 Bajo | ~5 min |
| B-2 | Debounce en escrituras de AsyncStorage (useGameSetup) | 🟠 Bajo | ~10 min |
| N-B1 | Keys estables en listas (AiGenerationForm, PlayerConfig) | 🟠 Bajo | ~10 min |
