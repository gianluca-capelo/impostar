import "@supabase/functions-js/edge-runtime.d.ts";
import { GENERATE_WORDS_PROMPT, VALIDATE_WORDS_PROMPT } from "./prompts.ts";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function validateDescription(description: unknown): string | null {
  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    return "Descripción requerida";
  }
  if (description.length > 200) {
    return "Descripción muy larga (max 200 caracteres)";
  }
  return null;
}

function parseWordsFromContent(content: string): string[] | null {
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

function validateWords(
  words: unknown
): { valid: string[] } | { error: string } {
  if (!Array.isArray(words)) {
    return { error: "Respuesta de IA inválida: no es un array" };
  }
  if (words.length === 0) {
    return { error: "Respuesta de IA inválida: no se recibieron palabras" };
  }
  const allValidStrings = words.every(
    (word): word is string => typeof word === "string" && word.trim().length > 0
  );
  if (!allValidStrings) {
    return {
      error: "Respuesta de IA inválida: elementos no son strings válidos",
    };
  }
  return { valid: words };
}

async function callGroq(
  messages: { role: string; content: string }[],
  temperature: number
): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "[]";
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Método no permitido" }, 405);
  }

  if (!Deno.env.get("GROQ_API_KEY")) {
    return jsonResponse({ error: "API key de GROQ no configurada" }, 500);
  }

  try {
    const { description } = await req.json();

    const descriptionError = validateDescription(description);
    if (descriptionError) {
      return jsonResponse({ error: descriptionError }, 400);
    }

    // Paso 1: Generar palabras
    const generatedContent = await callGroq(
      [{ role: "user", content: GENERATE_WORDS_PROMPT(description) }],
      0.3
    );
    const generatedWords = parseWordsFromContent(generatedContent);

    if (!generatedWords) {
      return jsonResponse({ error: "Error parseando respuesta de IA" }, 500);
    }

    // Paso 2: Validar semánticamente con IA
    const validatedContent = await callGroq(
      [
        {
          role: "user",
          content: VALIDATE_WORDS_PROMPT(description, generatedWords),
        },
      ],
      0
    );
    const validatedWords = parseWordsFromContent(validatedContent);

    if (!validatedWords) {
      console.warn(
        "AI validation failed to parse, falling back to generated words:",
        {
          description: description.substring(0, 50),
          generatedWordsCount: generatedWords.length,
          rawValidatedContent: validatedContent?.substring(0, 100),
        }
      );
      // Fallback a palabras originales si falla el validador
      const result = validateWords(generatedWords);
      if ("error" in result) {
        return jsonResponse({ error: result.error }, 500);
      }
      return jsonResponse({ words: result.valid });
    }

    // Paso 3: Validar formato final
    const result = validateWords(validatedWords);
    if ("error" in result) {
      return jsonResponse({ error: result.error }, 500);
    }

    return jsonResponse({ words: result.valid });
  } catch (error) {
    console.error("Error generating words:", {
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
    });
    return jsonResponse({ error: "Error al generar palabras" }, 500);
  }
});
