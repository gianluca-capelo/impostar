import { generateWordsFromDescription } from "../services/ai";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

describe("generateWordsFromDescription", () => {
  it("should return words on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ words: ["gato", "perro", "pájaro"] }),
    });

    const words = await generateWordsFromDescription("animales domésticos");
    expect(words).toEqual(["gato", "perro", "pájaro"]);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://impostar.app/api/generate-words",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "animales domésticos" }),
      }
    );
  });

  it("should include purchase token header when provided", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ words: ["gato"] }),
    });

    await generateWordsFromDescription("animales", "token-123");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://impostar.app/api/generate-words",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Purchase-Token": "token-123",
        },
        body: JSON.stringify({ description: "animales" }),
      }
    );
  });

  it("should throw SUBSCRIPTION_REQUIRED for subscription errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          error: "Subscription required",
          code: "SUBSCRIPTION_REQUIRED",
        }),
    });

    await expect(
      generateWordsFromDescription("animales")
    ).rejects.toThrow("SUBSCRIPTION_REQUIRED");
  });

  it("should throw error message from API", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Rate limit exceeded" }),
    });

    await expect(
      generateWordsFromDescription("animales")
    ).rejects.toThrow("Rate limit exceeded");
  });

  it("should throw generic error when API error response is not JSON", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error("not json")),
    });

    await expect(
      generateWordsFromDescription("animales")
    ).rejects.toThrow("Error al generar palabras");
  });

  it("should throw when success response is not valid JSON", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error("not json")),
    });

    await expect(
      generateWordsFromDescription("animales")
    ).rejects.toThrow("Respuesta inválida del servidor");
  });

  it("should throw generic error when API error has no message", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    await expect(
      generateWordsFromDescription("animales")
    ).rejects.toThrow("Error al generar palabras");
  });
});
