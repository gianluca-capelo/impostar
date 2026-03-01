import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadAiWords, saveAiWords, AI_WORDS_STORAGE_KEY } from "../services/aiWords";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockedStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("aiWords", () => {
  describe("loadAiWords", () => {
    it("returns [] when AsyncStorage is empty", async () => {
      mockedStorage.getItem.mockResolvedValue(null);
      const words = await loadAiWords();
      expect(words).toEqual([]);
      expect(mockedStorage.getItem).toHaveBeenCalledWith(AI_WORDS_STORAGE_KEY);
    });

    it("returns stored words when data exists", async () => {
      const stored = ["gato", "perro", "pájaro"];
      mockedStorage.getItem.mockResolvedValue(JSON.stringify(stored));
      const words = await loadAiWords();
      expect(words).toEqual(stored);
    });

    it("returns [] on read error (resilient to storage failure)", async () => {
      mockedStorage.getItem.mockRejectedValue(new Error("storage error"));
      const words = await loadAiWords();
      expect(words).toEqual([]);
    });
  });

  describe("saveAiWords", () => {
    it("persists words to AsyncStorage", async () => {
      mockedStorage.setItem.mockResolvedValue();
      await saveAiWords(["gato", "perro"]);
      expect(mockedStorage.setItem).toHaveBeenCalledWith(
        AI_WORDS_STORAGE_KEY,
        JSON.stringify(["gato", "perro"])
      );
    });

    it("persists empty array when clearing words", async () => {
      mockedStorage.setItem.mockResolvedValue();
      await saveAiWords([]);
      expect(mockedStorage.setItem).toHaveBeenCalledWith(
        AI_WORDS_STORAGE_KEY,
        JSON.stringify([])
      );
    });
  });
});
