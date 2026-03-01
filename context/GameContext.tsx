import React, { createContext, useContext, useState, ReactNode } from "react";
import { Alert } from "react-native";
import { GameState, Player, WordCategory, WORD_LISTS } from "../types/game";
import {
  getAvailableWords,
  addUsedWord,
  clearAllAppData,
} from "../services/wordHistory";

interface GameContextType {
  gameState: GameState;
  aiGeneratedWords: string[];
  setAiGeneratedWords: (words: string[]) => void;
  startGame: (
    numberOfPlayers: number,
    numberOfImpostors: number,
    playerNames: string[] | undefined,
    category: WordCategory,
    customWord?: string
  ) => Promise<void>;
  nextPlayer: () => void;
  resetGame: () => void;
  startNewRound: () => void;
  startNewRoundSameCategory: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialGameState: GameState = {
  players: [],
  numberOfPlayers: 0,
  numberOfImpostors: 0,
  secretWord: "",
  category: "aleatorio",
  phase: "setup",
  currentPlayerIndex: 0,
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  /**
   * Player names stored separately from gameState.players to persist across rounds.
   * Only cleared when user returns to initial setup (resetGame).
   * Used by startGame/assignRoles to recreate players with same names.
   */
  const [savedPlayerNames, setSavedPlayerNames] = useState<string[] | undefined>();
  const [aiGeneratedWords, setAiGeneratedWords] = useState<string[]>([]);

  const getRandomWord = async (category: WordCategory): Promise<string> => {
    if (category === "personalizado" || category === "aleatorio" || category === "ia_generado") {
      return "";
    }
    const words = WORD_LISTS[category];
    const availableWords = await getAvailableWords(category, words);

    if (availableWords.length === 0) {
      Alert.alert(
        "Sin palabras disponibles",
        `Ya usaste todas las palabras de "${category}". Se repetirá una palabra.`
      );
      return words[Math.floor(Math.random() * words.length)];
    }

    return availableWords[Math.floor(Math.random() * availableWords.length)];
  };

  const getRandomWordFromAllCategories = async (): Promise<{ word: string; sourceCategory: string }> => {
    const categories: (keyof typeof WORD_LISTS)[] = ["comida", "películas", "lugares", "objetos"];

    // Shuffle categories and try to find one with available words
    const shuffledCategories = [...categories].sort(() => Math.random() - 0.5);

    for (const category of shuffledCategories) {
      const availableWords = await getAvailableWords(category, WORD_LISTS[category]);
      if (availableWords.length > 0) {
        return {
          word: availableWords[Math.floor(Math.random() * availableWords.length)],
          sourceCategory: category,
        };
      }
    }

    // All categories exhausted - show warning and pick any word
    Alert.alert(
      "Sin palabras disponibles",
      "Ya usaste todas las palabras. Considera reiniciar el historial."
    );
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const words = WORD_LISTS[randomCategory];
    return {
      word: words[Math.floor(Math.random() * words.length)],
      sourceCategory: randomCategory,
    };
  };

  /**
   * Selects a secret word based on the category type.
   * Returns the word and the category to use for history tracking.
   */
  const selectSecretWord = async (
    category: WordCategory,
    customWord?: string
  ): Promise<{ secretWord: string; categoryForHistory: string; noAiWordsAvailable?: boolean }> => {
    if (category === "personalizado") {
      return {
        secretWord: customWord || "",
        categoryForHistory: category,
      };
    }

    if (category === "aleatorio") {
      const result = await getRandomWordFromAllCategories();
      return {
        secretWord: result.word,
        categoryForHistory: result.sourceCategory,
      };
    }

    if (category === "ia_generado") {
      if (aiGeneratedWords.length === 0) {
        return {
          secretWord: "",
          categoryForHistory: "ia_generado",
          noAiWordsAvailable: true,
        };
      }

      const availableAiWords = await getAvailableWords("ia_generado", aiGeneratedWords);
      if (availableAiWords.length === 0) {
        Alert.alert(
          "Sin palabras IA disponibles",
          "Ya usaste todas las palabras generadas. Se repetirá una palabra."
        );
        return {
          secretWord: aiGeneratedWords[Math.floor(Math.random() * aiGeneratedWords.length)],
          categoryForHistory: "ia_generado",
        };
      }

      return {
        secretWord: availableAiWords[Math.floor(Math.random() * availableAiWords.length)],
        categoryForHistory: "ia_generado",
      };
    }

    // Regular category
    return {
      secretWord: await getRandomWord(category),
      categoryForHistory: category,
    };
  };

  /**
   * Creates players array with randomly assigned impostors.
   */
  const assignRoles = (
    numberOfPlayers: number,
    numberOfImpostors: number,
    playerNames: string[]
  ): Player[] => {
    // Create players
    const players: Player[] = [];
    for (let i = 0; i < numberOfPlayers; i++) {
      players.push({
        id: i,
        name: playerNames[i]?.trim() || `Jugador ${i + 1}`,
        isImpostor: false,
      });
    }

    // Randomly assign impostors
    const impostorIndices = new Set<number>();
    while (impostorIndices.size < numberOfImpostors) {
      const randomIndex = Math.floor(Math.random() * numberOfPlayers);
      impostorIndices.add(randomIndex);
    }

    impostorIndices.forEach((index) => {
      players[index].isImpostor = true;
    });

    return players;
  };

  const startGame = async (
    numberOfPlayers: number,
    numberOfImpostors: number,
    playerNames: string[] | undefined,
    category: WordCategory,
    customWord?: string
  ): Promise<void> => {
    setSavedPlayerNames(playerNames);

    try {
      // Select secret word
      const { secretWord, categoryForHistory, noAiWordsAvailable } = await selectSecretWord(category, customWord);

      // Handle case when no AI words are available
      if (noAiWordsAvailable) {
        Alert.alert(
          "Error",
          "No hay palabras generadas. Usando palabra aleatoria."
        );
        const result = await getRandomWordFromAllCategories();
        const fallbackWord = result.word;
        const fallbackCategory = result.sourceCategory;

        // Add fallback word to history
        if (fallbackWord) {
          await addUsedWord(fallbackCategory, fallbackWord);
        }

        const players = assignRoles(numberOfPlayers, numberOfImpostors, playerNames || []);

        // N-C1: use fallbackCategory so gameState.category reflects the actual word category
        setGameState({
          players,
          numberOfPlayers,
          numberOfImpostors,
          secretWord: fallbackWord,
          category: fallbackCategory,
          phase: "roles",
          currentPlayerIndex: 0,
        });
        return;
      }

      // Add word to history (except custom words)
      if (secretWord && category !== "personalizado") {
        await addUsedWord(categoryForHistory, secretWord);
      }

      // Create players with roles
      const players = assignRoles(numberOfPlayers, numberOfImpostors, playerNames || []);

      setGameState({
        players,
        numberOfPlayers,
        numberOfImpostors,
        secretWord,
        category,
        phase: "roles",
        currentPlayerIndex: 0,
      });
    } catch (err) {
      if (err instanceof Error && err.message === "TIMEOUT") {
        throw new Error("La generación tardó demasiado. Verifica tu conexión.");
      }
      throw err;
    }
  };

  const nextPlayer = () => {
    setGameState((prev) => {
      const nextIndex = prev.currentPlayerIndex + 1;
      if (nextIndex >= prev.numberOfPlayers) {
        return {
          ...prev,
          phase: "complete",
          currentPlayerIndex: nextIndex,
        };
      }
      return {
        ...prev,
        currentPlayerIndex: nextIndex,
      };
    });
  };

  const resetGame = () => {
    setSavedPlayerNames(undefined);
    setAiGeneratedWords([]);
    setGameState(initialGameState);
  };

  const startNewRound = () => {
    // Note: savedPlayerNames is intentionally NOT cleared here.
    // Names persist so they can be reused when startGame is called.
    setGameState((prev) => ({
      ...prev,
      players: [],
      secretWord: "",
      category: "aleatorio",
      phase: "setup",
      currentPlayerIndex: 0,
    }));
  };

  const startNewRoundSameCategory = async (): Promise<void> => {
    const { numberOfPlayers, numberOfImpostors, category, players: currentPlayers } = gameState;

    // Para categoría personalizado, redirigir a selección de categoría
    if (category === "personalizado") {
      startNewRound();
      return;
    }

    try {
      // Select secret word
      const { secretWord, categoryForHistory, noAiWordsAvailable } = await selectSecretWord(category);

      // Handle case when no AI words are available
      if (noAiWordsAvailable) {
        Alert.alert(
          "Error",
          "No hay palabras generadas. Selecciona otra categoría."
        );
        startNewRound();
        return;
      }

      // Add word to history
      if (secretWord) {
        await addUsedWord(categoryForHistory, secretWord);
      }

      // Preserve names from current players
      const playerNames = currentPlayers.map((p) => p.name);
      const players = assignRoles(numberOfPlayers, numberOfImpostors, playerNames);

      setGameState((prev) => ({
        ...prev,
        players,
        secretWord,
        phase: "roles",
        currentPlayerIndex: 0,
      }));
    } catch (err) {
      if (err instanceof Error && err.message === "TIMEOUT") {
        throw new Error("La generación tardó demasiado. Verifica tu conexión.");
      }
      throw err;
    }
  };

  const resetAllData = async (): Promise<void> => {
    await clearAllAppData();
    setAiGeneratedWords([]);
    Alert.alert(
      "Historial borrado",
      "Las palabras ya utilizadas y la configuración se han restablecido."
    );
  };

  return (
    <GameContext.Provider value={{ gameState, aiGeneratedWords, setAiGeneratedWords, startGame, nextPlayer, resetGame, startNewRound, startNewRoundSameCategory, resetAllData }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
