import { WordCategory } from "../types/game";

export interface GameSetupValidation {
  numberOfPlayers: string;
  numberOfImpostors: string;
  category: WordCategory;
  customWord: string;
  aiGeneratedWordsCount: number;
}

export function validateGameSetup(config: GameSetupValidation): string | null {
  const players = parseInt(config.numberOfPlayers) || 0;
  const impostors = parseInt(config.numberOfImpostors) || 0;

  if (players < 3) return "Se necesitan al menos 3 jugadores";
  if (players > 12) return "Máximo 12 jugadores";
  if (impostors < 1) return "Se necesita al menos 1 impostor";
  if (impostors >= players)
    return "El número de impostores debe ser menor que el número de jugadores";
  if (config.category === "personalizado" && !config.customWord.trim())
    return "Debes escribir una palabra secreta";
  if (config.category === "ia_generado" && config.aiGeneratedWordsCount === 0)
    return "Primero debes generar palabras con IA";

  return null;
}
