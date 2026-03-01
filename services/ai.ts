import { API_BASE_URL } from "@/config"; // M-2: configurable base URL

export interface GenerateWordsResponse {
  words: string[];
}

export interface GenerateWordsError {
  error: string;
  code?: string;
}

export async function generateWordsFromDescription(
  description: string,
  purchaseToken?: string,
  signal?: AbortSignal // N-M1: caller can pass a signal to cancel on unmount
): Promise<string[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add purchase token for subscription verification if available
  if (purchaseToken) {
    headers["X-Purchase-Token"] = purchaseToken;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  // N-M1: forward external abort signal to our internal controller
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      const err = new Error("AbortError");
      err.name = "AbortError";
      throw err;
    }
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/generate-words`, { // M-2
      method: "POST",
      headers,
      body: JSON.stringify({ description }),
      signal: controller.signal,
    });
  } catch (err) {
    // M-4: translate errors to user-friendly messages at the source
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("La generación tardó demasiado. Verifica tu conexión.");
    }
    if (err instanceof TypeError) {
      throw new Error("Sin conexión a internet. Verifica tu conexión.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let errorData: GenerateWordsError;
    try {
      errorData = await response.json();
    } catch {
      throw new Error("Error al generar palabras");
    }

    // Handle subscription required error specifically
    if (errorData.code === "SUBSCRIPTION_REQUIRED") {
      throw new Error("SUBSCRIPTION_REQUIRED");
    }

    throw new Error(errorData.error || "Error al generar palabras");
  }

  let data: GenerateWordsResponse;
  try {
    data = await response.json();
  } catch {
    throw new Error("Respuesta inválida del servidor");
  }

  // N-M2: validate response shape at runtime (TypeScript cast doesn't check at runtime)
  if (!Array.isArray(data.words)) {
    throw new Error("Respuesta inválida del servidor");
  }

  return data.words;
}
