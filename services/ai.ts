export interface GenerateWordsResponse {
  words: string[];
}

export interface GenerateWordsError {
  error: string;
  code?: string;
}

export async function generateWordsFromDescription(
  description: string,
  purchaseToken?: string
): Promise<string[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add purchase token for subscription verification if available
  if (purchaseToken) {
    headers["X-Purchase-Token"] = purchaseToken;
  }

  const response = await fetch("https://impostar.app/api/generate-words", {
    method: "POST",
    headers,
    body: JSON.stringify({ description }),
  });

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

  return data.words;
}
