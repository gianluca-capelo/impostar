import { WordCategory } from "../types/game";

export interface CategoryOption {
  value: WordCategory;
  label: string;
  emoji: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "aleatorio", label: "Aleatorio", emoji: "\u{1F3B2}" },
  { value: "comida", label: "Comida", emoji: "\u{1F355}" },
  { value: "películas", label: "Películas", emoji: "\u{1F3AC}" },
  { value: "lugares", label: "Lugares", emoji: "\u{1F4CD}" },
  { value: "objetos", label: "Objetos", emoji: "\u{1F4E6}" },
  { value: "acotar_saga", label: "ACOTAR Saga", emoji: "\u{1F987}" },
  { value: "lam_panelistas", label: "LAM Panelistas", emoji: "\u{1F4FA}" },
  { value: "politicos_argentinos", label: "Políticos Argentinos", emoji: "\u{1F3DB}\u{FE0F}" },
  { value: "conductores_streaming_argentinos", label: "Streamers Argentinos", emoji: "\u{1F399}\u{FE0F}" },
  { value: "farandula_argentina", label: "Farándula Argentina", emoji: "\u2B50" },
  { value: "cantantes_argentinos", label: "Cantantes Argentinos", emoji: "\u{1F3A4}" },
  { value: "rock_nacional", label: "Rock Nacional", emoji: "\u{1F3B8}" },
  { value: "provincias_argentinas", label: "Provincias Argentinas", emoji: "\u{1F5FA}\u{FE0F}" },
  { value: "barrios_porteños", label: "Barrios Porteños", emoji: "\u{1F3D8}\u{FE0F}" },
  { value: "jugadores_argentinos_futbol", label: "Jugadores Argentinos", emoji: "\u26BD" },
  { value: "equipos_futbol_argentinos", label: "Equipos Argentinos", emoji: "\u{1F3DF}\u{FE0F}" },
  { value: "personalizado", label: "Personalizado", emoji: "\u270F\u{FE0F}" },
];
