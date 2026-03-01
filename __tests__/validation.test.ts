import { validateGameSetup, GameSetupValidation } from "../utils/validation";

const validConfig: GameSetupValidation = {
  numberOfPlayers: "5",
  numberOfImpostors: "1",
  category: "aleatorio",
  customWord: "",
  aiGeneratedWordsCount: 0,
};

describe("validateGameSetup", () => {
  it("returns null for valid configuration", () => {
    expect(validateGameSetup(validConfig)).toBeNull();
  });

  it("rejects less than 3 players", () => {
    expect(
      validateGameSetup({ ...validConfig, numberOfPlayers: "2" })
    ).toBe("Se necesitan al menos 3 jugadores");
  });

  it("rejects 0 players", () => {
    expect(
      validateGameSetup({ ...validConfig, numberOfPlayers: "0" })
    ).toBe("Se necesitan al menos 3 jugadores");
  });

  it("rejects non-numeric players", () => {
    expect(
      validateGameSetup({ ...validConfig, numberOfPlayers: "abc" })
    ).toBe("Se necesitan al menos 3 jugadores");
  });

  it("rejects more than 12 players", () => {
    expect(
      validateGameSetup({ ...validConfig, numberOfPlayers: "13" })
    ).toBe("Máximo 12 jugadores");
  });

  it("accepts exactly 3 players", () => {
    expect(
      validateGameSetup({ ...validConfig, numberOfPlayers: "3" })
    ).toBeNull();
  });

  it("accepts exactly 12 players", () => {
    expect(
      validateGameSetup({ ...validConfig, numberOfPlayers: "12", numberOfImpostors: "1" })
    ).toBeNull();
  });

  it("rejects 0 impostors", () => {
    expect(
      validateGameSetup({ ...validConfig, numberOfImpostors: "0" })
    ).toBe("Se necesita al menos 1 impostor");
  });

  it("rejects impostors equal to players", () => {
    expect(
      validateGameSetup({
        ...validConfig,
        numberOfPlayers: "5",
        numberOfImpostors: "5",
      })
    ).toBe("El número de impostores debe ser menor que el número de jugadores");
  });

  it("rejects impostors greater than players", () => {
    expect(
      validateGameSetup({
        ...validConfig,
        numberOfPlayers: "5",
        numberOfImpostors: "6",
      })
    ).toBe("El número de impostores debe ser menor que el número de jugadores");
  });

  it("accepts impostors = players - 1", () => {
    expect(
      validateGameSetup({
        ...validConfig,
        numberOfPlayers: "5",
        numberOfImpostors: "4",
      })
    ).toBeNull();
  });

  it("rejects personalizado without custom word", () => {
    expect(
      validateGameSetup({
        ...validConfig,
        category: "personalizado",
        customWord: "",
      })
    ).toBe("Debes escribir una palabra secreta");
  });

  it("rejects personalizado with whitespace-only custom word", () => {
    expect(
      validateGameSetup({
        ...validConfig,
        category: "personalizado",
        customWord: "   ",
      })
    ).toBe("Debes escribir una palabra secreta");
  });

  it("accepts personalizado with a valid custom word", () => {
    expect(
      validateGameSetup({
        ...validConfig,
        category: "personalizado",
        customWord: "Pizza",
      })
    ).toBeNull();
  });

  it("rejects ia_generado without generated words", () => {
    expect(
      validateGameSetup({
        ...validConfig,
        category: "ia_generado",
        aiGeneratedWordsCount: 0,
      })
    ).toBe("Primero debes generar palabras con IA");
  });

  it("accepts ia_generado with generated words", () => {
    expect(
      validateGameSetup({
        ...validConfig,
        category: "ia_generado",
        aiGeneratedWordsCount: 10,
      })
    ).toBeNull();
  });

  it("returns first error when multiple validations fail", () => {
    // players < 3 should be the first error checked
    expect(
      validateGameSetup({
        numberOfPlayers: "1",
        numberOfImpostors: "0",
        category: "personalizado",
        customWord: "",
        aiGeneratedWordsCount: 0,
      })
    ).toBe("Se necesitan al menos 3 jugadores");
  });
});
