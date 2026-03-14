import { supabase } from "@/lib/supabase";

export interface GenerateWordsResponse {
  words: string[];
}

export interface GenerateWordsError {
  error: string;
  code?: string;
}

export async function generateWordsFromDescription(
  description: string,
  signal?: AbortSignal
): Promise<string[]> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 30_000);

  // Forward external abort signal to our internal controller
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      const err = new Error("AbortError");
      err.name = "AbortError";
      throw err;
    }
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const { data, error } = await supabase.functions.invoke("generate-words", {
      body: { description },
      signal: controller.signal,
    });

    if (error) {
      throw new Error(error.message || "Error al generar palabras");
    }

    if (!data?.words || !Array.isArray(data.words)) {
      throw new Error("Respuesta inválida del servidor");
    }

    return data.words;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      if (timedOut) {
        throw new Error("La generación tardó demasiado. Verifica tu conexión.");
      }
      const abortErr = new Error("Aborted");
      abortErr.name = "AbortError";
      throw abortErr;
    }
    if (err instanceof TypeError) {
      throw new Error("Sin conexión a internet. Verifica tu conexión.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
