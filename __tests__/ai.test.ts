import { generateWordsFromDescription } from "../services/ai";
import { supabase } from "../lib/supabase";

// Get the mocked invoke function (globally mocked in jest.setup.js)
const mockInvoke = supabase.functions.invoke as jest.Mock;

beforeEach(() => {
  mockInvoke.mockClear();
});

describe("generateWordsFromDescription", () => {
  it("should return words on success", async () => {
    mockInvoke.mockResolvedValue({
      data: { words: ["gato", "perro", "pájaro"] },
      error: null,
    });

    const words = await generateWordsFromDescription("animales domésticos");
    expect(words).toEqual(["gato", "perro", "pájaro"]);
    expect(mockInvoke).toHaveBeenCalledWith(
      "generate-words",
      expect.objectContaining({
        body: { description: "animales domésticos" },
      })
    );
  });

  it("should throw user-friendly message when fetch is aborted by timeout", async () => {
    jest.useFakeTimers();

    mockInvoke.mockImplementation(
      (_name: string, options: { signal?: AbortSignal }) => {
        return new Promise((_resolve, reject) => {
          options.signal?.addEventListener("abort", () => {
            const err = new Error("Aborted");
            err.name = "AbortError";
            reject(err);
          });
        });
      }
    );

    const promise = generateWordsFromDescription("animales");
    jest.advanceTimersByTime(30_001);

    await expect(promise).rejects.toThrow(
      "La generación tardó demasiado. Verifica tu conexión."
    );

    jest.useRealTimers();
  });

  it("should throw user-friendly message for network errors", async () => {
    mockInvoke.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(
      generateWordsFromDescription("animales")
    ).rejects.toThrow("Sin conexión a internet. Verifica tu conexión.");
  });

  it("should throw error message from API", async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: "Rate limit exceeded" },
    });

    await expect(
      generateWordsFromDescription("animales")
    ).rejects.toThrow("Rate limit exceeded");
  });

  it("should throw generic error when API error has no message", async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: "" },
    });

    await expect(
      generateWordsFromDescription("animales")
    ).rejects.toThrow("Error al generar palabras");
  });

  it("should throw when words is null", async () => {
    mockInvoke.mockResolvedValue({
      data: { words: null },
      error: null,
    });

    await expect(
      generateWordsFromDescription("animales")
    ).rejects.toThrow("Respuesta inválida del servidor");
  });

  it("should throw when words is a string instead of array", async () => {
    mockInvoke.mockResolvedValue({
      data: { words: "gato perro" },
      error: null,
    });

    await expect(
      generateWordsFromDescription("animales")
    ).rejects.toThrow("Respuesta inválida del servidor");
  });

  it("should throw when words field is missing", async () => {
    mockInvoke.mockResolvedValue({
      data: {},
      error: null,
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

    // invoke should NOT have been called since signal was already aborted
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("should abort the fetch when the external signal fires mid-request", async () => {
    const controller = new AbortController();

    mockInvoke.mockImplementation(() => {
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
