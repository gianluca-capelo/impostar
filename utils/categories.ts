import { WordCategory, CategoryGroup } from "../types/game";

export interface CategoryOption {
  value: WordCategory;
  label: string;
  emoji: string;
  group: CategoryGroup | "special";
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "aleatorio", label: "Aleatorio", emoji: "\u{1F3B2}", group: "special" },
  { value: "comida", label: "Comida", emoji: "\u{1F355}", group: "general" },
  { value: "películas", label: "Películas", emoji: "\u{1F3AC}", group: "general" },
  { value: "lugares", label: "Lugares", emoji: "\u{1F4CD}", group: "general" },
  { value: "objetos", label: "Objetos", emoji: "\u{1F4E6}", group: "general" },
  { value: "acotar_saga", label: "ACOTAR Saga", emoji: "\u{1F987}", group: "argentina" },
  { value: "lam_panelistas", label: "LAM Panelistas", emoji: "\u{1F4FA}", group: "argentina" },
  { value: "politicos_argentinos", label: "Políticos Argentinos", emoji: "\u{1F3DB}\u{FE0F}", group: "argentina" },
  { value: "conductores_streaming_argentinos", label: "Streamers Argentinos", emoji: "\u{1F399}\u{FE0F}", group: "argentina" },
  { value: "farandula_argentina", label: "Farándula Argentina", emoji: "\u2B50", group: "argentina" },
  { value: "cantantes_argentinos", label: "Cantantes Argentinos", emoji: "\u{1F3A4}", group: "argentina" },
  { value: "rock_nacional", label: "Rock Nacional", emoji: "\u{1F3B8}", group: "argentina" },
  { value: "provincias_argentinas", label: "Provincias Argentinas", emoji: "\u{1F5FA}\u{FE0F}", group: "argentina" },
  { value: "barrios_porteños", label: "Barrios Porteños", emoji: "\u{1F3D8}\u{FE0F}", group: "argentina" },
  { value: "jugadores_argentinos_futbol", label: "Jugadores Argentinos", emoji: "\u26BD", group: "argentina" },
  { value: "equipos_futbol_argentinos", label: "Equipos Argentinos", emoji: "\u{1F3DF}\u{FE0F}", group: "argentina" },
  { value: "personalizado", label: "Personalizado", emoji: "\u270F\u{FE0F}", group: "special" },
];

export function getCategoriesForGroup(group: CategoryGroup): CategoryOption[] {
  return CATEGORY_OPTIONS.filter(
    (c) => c.group === group || c.group === "special"
  );
}

export function getPlayableCategoriesForGroup(group: CategoryGroup): WordCategory[] {
  return CATEGORY_OPTIONS
    .filter((c) => c.group === group)
    .map((c) => c.value);
}
