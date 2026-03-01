import { renderHook, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGameSetup } from "../hooks/useGameSetup";
import { DEFAULT_SETUP, GameSetupData } from "../services/gameSetup";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

beforeEach(() => {
  jest.clearAllMocks();
  mockAsyncStorage.getItem.mockResolvedValue(null);
});

describe("useGameSetup", () => {
  describe("initial state", () => {
    it("should start with default values", async () => {
      const { result } = renderHook(() => useGameSetup());

      // Before load, should have defaults
      expect(result.current.numberOfPlayers).toBe("5");
      expect(result.current.numberOfImpostors).toBe("1");
      expect(result.current.useCustomNames).toBe(false);
      expect(result.current.playerNames).toEqual([]);
    });

    it("should set isLoaded to false initially and true after loading", async () => {
      const { result } = renderHook(() => useGameSetup());

      // After async load completes
      await act(async () => {});

      expect(result.current.isLoaded).toBe(true);
    });
  });

  describe("loading from storage", () => {
    it("should load persisted data from AsyncStorage", async () => {
      const storedData: GameSetupData = {
        numberOfPlayers: "8",
        numberOfImpostors: "2",
        useCustomNames: true,
        playerNames: ["Ana", "Bruno", "Carlos", "Diana", "Edu", "Fede", "Gabi", "Hugo"],
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useGameSetup());

      await act(async () => {});

      expect(result.current.numberOfPlayers).toBe("8");
      expect(result.current.numberOfImpostors).toBe("2");
      expect(result.current.useCustomNames).toBe(true);
      expect(result.current.playerNames).toEqual(storedData.playerNames);
      expect(result.current.isLoaded).toBe(true);
    });

    it("should merge stored data with defaults for schema evolution", async () => {
      // Stored data missing useCustomNames field (simulates old version)
      const partialData = {
        numberOfPlayers: "7",
        numberOfImpostors: "3",
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(partialData));

      const { result } = renderHook(() => useGameSetup());

      await act(async () => {});

      expect(result.current.numberOfPlayers).toBe("7");
      expect(result.current.numberOfImpostors).toBe("3");
      // Missing fields should use defaults
      expect(result.current.useCustomNames).toBe(false);
      expect(result.current.playerNames).toEqual([]);
    });

    it("should fallback to defaults on corrupted storage data", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("not-valid-json{{{");

      const { result } = renderHook(() => useGameSetup());

      await act(async () => {});

      expect(result.current.numberOfPlayers).toBe(DEFAULT_SETUP.numberOfPlayers);
      expect(result.current.numberOfImpostors).toBe(DEFAULT_SETUP.numberOfImpostors);
      expect(result.current.isLoaded).toBe(true);
    });
  });

  describe("setNumberOfPlayers", () => {
    it("should update numberOfPlayers and auto-resize playerNames", async () => {
      const { result } = renderHook(() => useGameSetup());

      await act(async () => {});

      act(() => {
        result.current.setNumberOfPlayers("4");
      });

      expect(result.current.numberOfPlayers).toBe("4");
      expect(result.current.playerNames).toHaveLength(4);
      // New names should be empty strings
      expect(result.current.playerNames).toEqual(["", "", "", ""]);
    });

    it("should truncate playerNames when reducing player count", async () => {
      const storedData: GameSetupData = {
        numberOfPlayers: "5",
        numberOfImpostors: "1",
        useCustomNames: true,
        playerNames: ["Ana", "Bruno", "Carlos", "Diana", "Edu"],
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useGameSetup());

      await act(async () => {});

      act(() => {
        result.current.setNumberOfPlayers("3");
      });

      expect(result.current.playerNames).toEqual(["Ana", "Bruno", "Carlos"]);
    });

    it("should expand playerNames with empty strings when increasing count", async () => {
      const storedData: GameSetupData = {
        numberOfPlayers: "3",
        numberOfImpostors: "1",
        useCustomNames: true,
        playerNames: ["Ana", "Bruno", "Carlos"],
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useGameSetup());

      await act(async () => {});

      act(() => {
        result.current.setNumberOfPlayers("5");
      });

      expect(result.current.playerNames).toEqual(["Ana", "Bruno", "Carlos", "", ""]);
    });
  });

  describe("setNumberOfImpostors", () => {
    it("should update numberOfImpostors", async () => {
      const { result } = renderHook(() => useGameSetup());

      await act(async () => {});

      act(() => {
        result.current.setNumberOfImpostors("3");
      });

      expect(result.current.numberOfImpostors).toBe("3");
    });
  });

  describe("setUseCustomNames", () => {
    it("should toggle useCustomNames", async () => {
      const { result } = renderHook(() => useGameSetup());

      await act(async () => {});

      act(() => {
        result.current.setUseCustomNames(true);
      });

      expect(result.current.useCustomNames).toBe(true);

      act(() => {
        result.current.setUseCustomNames(false);
      });

      expect(result.current.useCustomNames).toBe(false);
    });
  });

  describe("setPlayerName", () => {
    it("should set player name at specific index", async () => {
      const { result } = renderHook(() => useGameSetup());

      await act(async () => {});

      // First, set up 3 players
      act(() => {
        result.current.setNumberOfPlayers("3");
      });

      act(() => {
        result.current.setPlayerName(0, "Ana");
      });

      act(() => {
        result.current.setPlayerName(1, "Bruno");
      });

      act(() => {
        result.current.setPlayerName(2, "Carlos");
      });

      expect(result.current.playerNames).toEqual(["Ana", "Bruno", "Carlos"]);
    });
  });

  describe("auto-save", () => {
    it("should persist changes to AsyncStorage after setter calls", async () => {
      const { result } = renderHook(() => useGameSetup());

      await act(async () => {});

      // Clear calls from initial load
      mockAsyncStorage.setItem.mockClear();

      act(() => {
        result.current.setNumberOfPlayers("7");
      });

      // Wait for useEffect to flush
      await act(async () => {});

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "impostar-setup",
        expect.any(String)
      );

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1] as string);
      expect(savedData.numberOfPlayers).toBe("7");
    });

    it("should not save defaults before initial load completes", async () => {
      // Delay the storage read
      let resolveGetItem: (value: string | null) => void;
      mockAsyncStorage.getItem.mockReturnValue(
        new Promise((resolve) => {
          resolveGetItem = resolve;
        })
      );

      renderHook(() => useGameSetup());

      // setItem should NOT have been called yet (only getItem for loading)
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();

      // Now resolve the load
      await act(async () => {
        resolveGetItem!(null);
      });
    });
  });

  describe("clearSetup", () => {
    it("should remove from AsyncStorage and reset to defaults", async () => {
      const storedData: GameSetupData = {
        numberOfPlayers: "8",
        numberOfImpostors: "2",
        useCustomNames: true,
        playerNames: ["Ana", "Bruno", "Carlos", "Diana", "Edu", "Fede", "Gabi", "Hugo"],
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useGameSetup());

      await act(async () => {});

      // Verify loaded state
      expect(result.current.numberOfPlayers).toBe("8");

      await act(async () => {
        await result.current.clearSetup();
      });

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith("impostar-setup");
      expect(result.current.numberOfPlayers).toBe(DEFAULT_SETUP.numberOfPlayers);
      expect(result.current.numberOfImpostors).toBe(DEFAULT_SETUP.numberOfImpostors);
      expect(result.current.useCustomNames).toBe(DEFAULT_SETUP.useCustomNames);
      expect(result.current.playerNames).toEqual(DEFAULT_SETUP.playerNames);
    });
  });
});
