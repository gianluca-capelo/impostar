import React from "react";
import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { GameProvider, useGame } from "../context/GameContext";
import { WORD_LISTS } from "../types/game";
import { getPlayableCategoriesForGroup } from "../utils/categories";
import * as wordHistoryService from "../services/wordHistory";
import * as aiWordsService from "../services/aiWords";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock wordHistory service so we control what's "used"
jest.mock("../services/wordHistory");

jest.mock("../services/aiWords");

const mockedWordHistory = wordHistoryService as jest.Mocked<typeof wordHistoryService>;
const mockedAiWords = aiWordsService as jest.Mocked<typeof aiWordsService>;

// Mock Alert.alert
jest.spyOn(Alert, "alert").mockImplementation(() => {});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GameProvider>{children}</GameProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  // Default: no words used, all available
  mockedWordHistory.getAvailableWords.mockImplementation(
    async (_category: string, allWords: string[]) => allWords
  );
  mockedWordHistory.addUsedWord.mockResolvedValue(undefined);
  mockedWordHistory.clearAllAppData.mockResolvedValue(undefined);
  mockedAiWords.loadAiWords.mockResolvedValue([]);
  mockedAiWords.saveAiWords.mockResolvedValue(undefined);
});

describe("GameContext", () => {
  describe("initial state", () => {
    it("should have correct initial game state", () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      expect(result.current.gameState).toEqual({
        players: [],
        numberOfPlayers: 0,
        numberOfImpostors: 0,
        secretWord: "",
        category: "aleatorio",
        categoryGroup: "general",
        phase: "setup",
        currentPlayerIndex: 0,
      });
    });
  });

  describe("startGame - role assignment", () => {
    it("should create correct number of players", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(5, 1, undefined, "comida");
      });

      expect(result.current.gameState.players).toHaveLength(5);
      expect(result.current.gameState.numberOfPlayers).toBe(5);
    });

    it("should assign correct number of impostors", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(6, 2, undefined, "comida");
      });

      const impostors = result.current.gameState.players.filter((p) => p.isImpostor);
      expect(impostors).toHaveLength(2);
    });

    it("should use provided player names", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });
      const names = ["Ana", "Bruno", "Carlos"];

      await act(async () => {
        await result.current.startGame(3, 1, names, "comida");
      });

      expect(result.current.gameState.players[0].name).toBe("Ana");
      expect(result.current.gameState.players[1].name).toBe("Bruno");
      expect(result.current.gameState.players[2].name).toBe("Carlos");
    });

    it("should use default names when none provided", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(3, 1, undefined, "comida");
      });

      expect(result.current.gameState.players[0].name).toBe("Jugador 1");
      expect(result.current.gameState.players[1].name).toBe("Jugador 2");
      expect(result.current.gameState.players[2].name).toBe("Jugador 3");
    });

    it("should transition to roles phase", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(4, 1, undefined, "comida");
      });

      expect(result.current.gameState.phase).toBe("roles");
      expect(result.current.gameState.currentPlayerIndex).toBe(0);
    });
  });

  describe("startGame - word selection", () => {
    it("should select a word from the correct category", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(4, 1, undefined, "comida");
      });

      expect(WORD_LISTS.comida).toContain(result.current.gameState.secretWord);
      expect(result.current.gameState.category).toBe("comida");
    });

    it("should record word in history", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(4, 1, undefined, "comida");
      });

      expect(mockedWordHistory.addUsedWord).toHaveBeenCalledWith(
        "comida",
        result.current.gameState.secretWord
      );
    });

    it("should use custom word for personalizado category", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(4, 1, undefined, "personalizado", "MiPalabra");
      });

      expect(result.current.gameState.secretWord).toBe("MiPalabra");
      // Custom words should NOT be added to history
      expect(mockedWordHistory.addUsedWord).not.toHaveBeenCalled();
    });

    it("should select from any base category when aleatorio", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(4, 1, undefined, "aleatorio");
      });

      const word = result.current.gameState.secretWord;
      const allBaseWords = [
        ...WORD_LISTS.comida,
        ...WORD_LISTS["películas"],
        ...WORD_LISTS.lugares,
        ...WORD_LISTS.objetos,
      ];
      expect(allBaseWords).toContain(word);
    });

    it("should show alert and fallback when all words exhausted", async () => {
      // Simulate all words used
      mockedWordHistory.getAvailableWords.mockResolvedValue([]);

      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(4, 1, undefined, "comida");
      });

      // Should still have a word (fallback)
      expect(result.current.gameState.secretWord).toBeTruthy();
      // Should show alert about exhausted words
      expect(Alert.alert).toHaveBeenCalledWith(
        "Sin palabras disponibles",
        expect.any(String)
      );
    });

    it("should fallback to random word when no AI words available", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      // aiGeneratedWords is empty by default
      await act(async () => {
        await result.current.startGame(4, 1, undefined, "ia_generado");
      });

      // Should show error alert
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "No hay palabras generadas. Usando palabra aleatoria."
      );
      // Should still have a fallback word from base categories
      expect(result.current.gameState.secretWord).toBeTruthy();
    });

    it("N-C1: gameState.category should reflect fallback category, not ia_generado", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      // aiGeneratedWords is empty — will trigger fallback
      await act(async () => {
        await result.current.startGame(4, 1, undefined, "ia_generado");
      });

      // Category must be the actual fallback category used, never "ia_generado"
      expect(result.current.gameState.category).not.toBe("ia_generado");
      // And it should be one of the standard base categories
      const baseCategories = ["comida", "películas", "lugares", "objetos"];
      expect(baseCategories).toContain(result.current.gameState.category);
    });

    it("N-C2: startGame should propagate errors from async operations", async () => {
      mockedWordHistory.addUsedWord.mockRejectedValue(new Error("Storage error"));
      const { result } = renderHook(() => useGame(), { wrapper });

      await expect(
        act(async () => {
          await result.current.startGame(4, 1, undefined, "comida");
        })
      ).rejects.toThrow("Storage error");
    });
  });

  describe("nextPlayer", () => {
    it("should increment currentPlayerIndex", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(3, 1, undefined, "comida");
      });

      act(() => {
        result.current.nextPlayer();
      });

      expect(result.current.gameState.currentPlayerIndex).toBe(1);
      expect(result.current.gameState.phase).toBe("roles");
    });

    it("should transition to complete when all players seen", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(2, 1, undefined, "comida");
      });

      act(() => {
        result.current.nextPlayer();
      });
      // Index 1 → still roles (last player viewing)

      act(() => {
        result.current.nextPlayer();
      });
      // Index 2 >= numberOfPlayers(2) → complete

      expect(result.current.gameState.phase).toBe("complete");
    });
  });

  describe("resetGame", () => {
    it("should reset to initial state", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(4, 1, ["A", "B", "C", "D"], "comida");
      });

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.gameState.phase).toBe("setup");
      expect(result.current.gameState.players).toEqual([]);
      expect(result.current.gameState.secretWord).toBe("");
    });
  });

  describe("startNewRound", () => {
    it("should reset game state but keep category as aleatorio", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(4, 1, undefined, "comida");
      });

      act(() => {
        result.current.startNewRound();
      });

      expect(result.current.gameState.phase).toBe("setup");
      expect(result.current.gameState.players).toEqual([]);
      expect(result.current.gameState.secretWord).toBe("");
      expect(result.current.gameState.category).toBe("aleatorio");
    });
  });

  describe("startNewRoundSameCategory", () => {
    it("should start new round with same category and player names", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });
      const names = ["Ana", "Bruno", "Carlos"];

      await act(async () => {
        await result.current.startGame(3, 1, names, "comida");
      });

      const firstWord = result.current.gameState.secretWord;

      await act(async () => {
        await result.current.startNewRoundSameCategory();
      });

      expect(result.current.gameState.phase).toBe("roles");
      expect(result.current.gameState.players).toHaveLength(3);
      expect(result.current.gameState.players[0].name).toBe("Ana");
      // Category preserved
      expect(result.current.gameState.category).toBe("comida");
      // New word selected (could be same by chance, but history was recorded)
      expect(result.current.gameState.secretWord).toBeTruthy();
    });

    it("N-C2: startNewRoundSameCategory should propagate errors from async operations", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      // Start a normal game first so gameState has category "comida"
      await act(async () => {
        await result.current.startGame(3, 1, undefined, "comida");
      });

      // Now make addUsedWord fail on the next call
      mockedWordHistory.addUsedWord.mockRejectedValue(new Error("Storage error"));

      await expect(
        act(async () => {
          await result.current.startNewRoundSameCategory();
        })
      ).rejects.toThrow("Storage error");
    });

    it("should redirect to startNewRound for personalizado category", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(3, 1, undefined, "personalizado", "test");
      });

      await act(async () => {
        await result.current.startNewRoundSameCategory();
      });

      // Should redirect to setup (startNewRound behavior)
      expect(result.current.gameState.phase).toBe("setup");
      expect(result.current.gameState.category).toBe("aleatorio");
    });
  });

  describe("resetAllData", () => {
    it("should call clearAllAppData and show confirmation", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.resetAllData();
      });

      expect(mockedWordHistory.clearAllAppData).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        "Historial borrado",
        expect.any(String)
      );
    });
  });

  describe("AI words persistence", () => {
    it("should load persisted AI words from storage on mount", async () => {
      const storedWords = ["gato", "perro", "pájaro"];
      mockedAiWords.loadAiWords.mockResolvedValue(storedWords);

      const { result } = renderHook(() => useGame(), { wrapper });

      // Wait for the useEffect to resolve
      await act(async () => {});

      expect(mockedAiWords.loadAiWords).toHaveBeenCalled();
      expect(result.current.aiGeneratedWords).toEqual(storedWords);
    });

    it("should persist AI words to storage when setAiGeneratedWords is called", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });
      await act(async () => {});

      const newWords = ["manzana", "banana", "naranja"];
      act(() => {
        result.current.setAiGeneratedWords(newWords);
      });

      expect(mockedAiWords.saveAiWords).toHaveBeenCalledWith(newWords);
      expect(result.current.aiGeneratedWords).toEqual(newWords);
    });

    it("resetAllData clears AI words via clearAllAppData", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });
      await act(async () => {});

      // Set some AI words first
      act(() => {
        result.current.setAiGeneratedWords(["gato", "perro"]);
      });

      await act(async () => {
        await result.current.resetAllData();
      });

      expect(mockedWordHistory.clearAllAppData).toHaveBeenCalled();
      // AI words should be cleared in memory
      expect(result.current.aiGeneratedWords).toEqual([]);
    });

    it("resetGame clears AI words from memory and persists empty array", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });
      await act(async () => {});

      act(() => {
        result.current.setAiGeneratedWords(["gato", "perro"]);
      });
      jest.clearAllMocks();
      mockedAiWords.saveAiWords.mockResolvedValue(undefined);

      act(() => {
        result.current.resetGame();
      });

      expect(mockedAiWords.saveAiWords).toHaveBeenCalledWith([]);
      expect(result.current.aiGeneratedWords).toEqual([]);
    });
  });

  describe("impostor distribution (statistical)", () => {
    it("should always have exactly the requested number of impostors across many games", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      for (let i = 0; i < 20; i++) {
        // Reset between games
        act(() => {
          result.current.resetGame();
        });

        await act(async () => {
          await result.current.startGame(6, 2, undefined, "comida");
        });

        const impostors = result.current.gameState.players.filter((p) => p.isImpostor);
        expect(impostors).toHaveLength(2);

        const nonImpostors = result.current.gameState.players.filter((p) => !p.isImpostor);
        expect(nonImpostors).toHaveLength(4);
      }
    });

    it("should distribute impostors somewhat evenly across positions", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });
      const impostorPositions: Record<number, number> = {};

      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.resetGame();
        });

        await act(async () => {
          await result.current.startGame(4, 1, undefined, "comida");
        });

        result.current.gameState.players.forEach((p, idx) => {
          if (p.isImpostor) {
            impostorPositions[idx] = (impostorPositions[idx] || 0) + 1;
          }
        });
      }

      // Each position should get at least some impostors (not always position 0)
      for (let pos = 0; pos < 4; pos++) {
        expect(impostorPositions[pos]).toBeGreaterThan(0);
      }
    });
  });

  describe("word selection variety", () => {
    it("should not always pick the same word", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });
      const words = new Set<string>();

      for (let i = 0; i < 15; i++) {
        act(() => {
          result.current.resetGame();
        });

        await act(async () => {
          await result.current.startGame(4, 1, undefined, "comida");
        });

        words.add(result.current.gameState.secretWord);
      }

      // With 46 words in comida, 15 picks should give us at least 3 different ones
      expect(words.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe("startGame - category group scoping", () => {
    it("aleatorio con grupo 'general' selecciona de comida/películas/lugares/objetos", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(4, 1, undefined, "aleatorio", undefined, "general");
      });

      const word = result.current.gameState.secretWord;
      const generalWords = [
        ...WORD_LISTS.comida,
        ...WORD_LISTS["películas"],
        ...WORD_LISTS.lugares,
        ...WORD_LISTS.objetos,
      ];
      expect(generalWords).toContain(word);
    });

    it("aleatorio con grupo 'argentina' selecciona de categorías argentinas", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(4, 1, undefined, "aleatorio", undefined, "argentina");
      });

      const word = result.current.gameState.secretWord;
      const argentinaCategories = getPlayableCategoriesForGroup("argentina");
      const argentinaWords = argentinaCategories.flatMap(
        (cat) => WORD_LISTS[cat as keyof typeof WORD_LISTS] || []
      );
      expect(argentinaWords).toContain(word);
    });

    it("startNewRoundSameCategory con aleatorio respeta el categoryGroup guardado", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      // Start with argentina group
      await act(async () => {
        await result.current.startGame(4, 1, undefined, "aleatorio", undefined, "argentina");
      });

      expect(result.current.gameState.categoryGroup).toBe("argentina");

      // Start new round same category
      await act(async () => {
        await result.current.startNewRoundSameCategory();
      });

      const word = result.current.gameState.secretWord;
      const argentinaCategories = getPlayableCategoriesForGroup("argentina");
      const argentinaWords = argentinaCategories.flatMap(
        (cat) => WORD_LISTS[cat as keyof typeof WORD_LISTS] || []
      );
      expect(argentinaWords).toContain(word);
    });

    it("gameState.categoryGroup se guarda correctamente al iniciar juego", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(4, 1, undefined, "comida", undefined, "argentina");
      });

      expect(result.current.gameState.categoryGroup).toBe("argentina");
    });

    it("default categoryGroup es 'general' si no se especifica", async () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      await act(async () => {
        await result.current.startGame(4, 1, undefined, "comida");
      });

      expect(result.current.gameState.categoryGroup).toBe("general");
    });
  });
});
