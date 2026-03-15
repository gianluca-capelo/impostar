import {
  getCategoriesForGroup,
  getPlayableCategoriesForGroup,
  CATEGORY_OPTIONS,
} from "../utils/categories";

describe("getCategoriesForGroup", () => {
  it("general devuelve solo categorías generales + special (aleatorio, personalizado)", () => {
    const categories = getCategoriesForGroup("general");
    const values = categories.map((c) => c.value);

    // Should include the 4 general categories
    expect(values).toContain("comida");
    expect(values).toContain("películas");
    expect(values).toContain("lugares");
    expect(values).toContain("objetos");

    // Should include special categories
    expect(values).toContain("aleatorio");
    expect(values).toContain("personalizado");

    // Total: 4 general + 2 special = 6
    expect(categories).toHaveLength(6);
  });

  it("argentina devuelve solo categorías argentinas + special", () => {
    const categories = getCategoriesForGroup("argentina");
    const values = categories.map((c) => c.value);

    // Should include argentine categories
    expect(values).toContain("lam_panelistas");
    expect(values).toContain("politicos_argentinos");
    expect(values).toContain("conductores_streaming_argentinos");
    expect(values).toContain("farandula_argentina");
    expect(values).toContain("cantantes_argentinos");
    expect(values).toContain("rock_nacional");
    expect(values).toContain("provincias_argentinas");
    expect(values).toContain("barrios_porteños");
    expect(values).toContain("jugadores_argentinos_futbol");
    expect(values).toContain("equipos_futbol_argentinos");

    // Should include special categories
    expect(values).toContain("aleatorio");
    expect(values).toContain("personalizado");

    // Total: 10 argentina + 2 special = 12
    expect(categories).toHaveLength(12);
  });

  it("no incluye categorías del otro grupo", () => {
    const generalValues = getCategoriesForGroup("general").map((c) => c.value);
    const argentinaValues = getCategoriesForGroup("argentina").map((c) => c.value);

    // General should not include any argentine-only category
    expect(generalValues).not.toContain("politicos_argentinos");
    expect(generalValues).not.toContain("rock_nacional");
    expect(generalValues).not.toContain("barrios_porteños");

    // Argentina should not include any general-only category
    expect(argentinaValues).not.toContain("comida");
    expect(argentinaValues).not.toContain("películas");
    expect(argentinaValues).not.toContain("lugares");
    expect(argentinaValues).not.toContain("objetos");
  });
});

describe("getPlayableCategoriesForGroup", () => {
  it("general devuelve ['comida', 'películas', 'lugares', 'objetos']", () => {
    const playable = getPlayableCategoriesForGroup("general");

    expect(playable).toEqual(
      expect.arrayContaining(["comida", "películas", "lugares", "objetos"])
    );
    expect(playable).toHaveLength(4);
  });

  it("argentina devuelve las 11 categorías argentinas", () => {
    const playable = getPlayableCategoriesForGroup("argentina");

    expect(playable).toContain("lam_panelistas");
    expect(playable).toContain("politicos_argentinos");
    expect(playable).toContain("conductores_streaming_argentinos");
    expect(playable).toContain("farandula_argentina");
    expect(playable).toContain("cantantes_argentinos");
    expect(playable).toContain("rock_nacional");
    expect(playable).toContain("provincias_argentinas");
    expect(playable).toContain("barrios_porteños");
    expect(playable).toContain("jugadores_argentinos_futbol");
    expect(playable).toContain("equipos_futbol_argentinos");
    expect(playable).toHaveLength(10);
  });

  it("no incluye aleatorio, personalizado, ni ia_generado", () => {
    const generalPlayable = getPlayableCategoriesForGroup("general");
    const argentinaPlayable = getPlayableCategoriesForGroup("argentina");

    for (const playable of [generalPlayable, argentinaPlayable]) {
      expect(playable).not.toContain("aleatorio");
      expect(playable).not.toContain("personalizado");
      expect(playable).not.toContain("ia_generado");
    }
  });
});
