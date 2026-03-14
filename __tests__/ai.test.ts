import { generateWordsFromDescription } from "../services/ai";
import { API_BASE_URL } from "../config";

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
      `${API_BASE_URL}/api/generate-words`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "animales domésticos" }),
      })
    );
  });

  it("should throw user-friendly message when fetch is aborted by timeout", async () => {
    jest.useFakeTimers();

    // Simulate a hanging fetch that rejects when its signal is aborted
    mockFetch.mockImplementation((_url: string, options: RequestInit) => {
      return new Promise((_resolve, reject) => {
        (options.signal as AbortSignal).addEventListener("abort", () => {
          const err = new Error("Aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    });

    const promise = generateWordsFromDescription("animales");
    jest.advanceTimersByTime(30_001);

    await expect(promise).rejects.toThrow(
      "La generación tardó demasiado. Verifica tu conexión."
    );

    jest.useRealTimers();
  });

  it("should throw user-friendly message for network errors", async () => {
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(
      generateWordsFromDescription("animales")
    ).rejects.toThrow("Sin conexión a internet. Verifica tu conexión.");
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

  it("should throw when words is null", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ words: null }),
    });

    await expect(
      generateWordsFromDescription("animales")
    ).rejects.toThrow("Respuesta inválida del servidor");
  });

  it("should throw when words is a string instead of array", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ words: "gato perro" }),
    });

    await expect(
      generateWordsFromDescription("animales")
    ).rejects.toThrow("Respuesta inválida del servidor");
  });

  it("should throw when words field is missing", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await expect(
      generateWordsFromDescription("animales")
    ).rejects.toThrow("Respuesta inválida del servidor");
  });

  it("should throw when called with an already-aborted signal", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      generateWordsFromDescription("animales", controller.signal)
    ).rejects.toThrow();

    // fetch should NOT have been called since signal was already aborted
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should abort the fetch when the external signal fires mid-request", async () => {
    const controller = new AbortController();

    // Simulate fetch that only resolves after we manually abort
    mockFetch.mockImplementation(() => {
      return new Promise((_resolve, reject) => {
        controller.signal.addEventListener("abort", () => {
          const err = new Error("Aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    });

    const promise = generateWordsFromDescription("animales", controller.signal);
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });
});
