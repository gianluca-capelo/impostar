import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getWordHistory,
  getUsedWords,
  addUsedWord,
  isWordUsed,
  getAvailableWords,
  clearHistory,
  clearCategoryHistory,
  clearAllAppData,
} from "../services/wordHistory";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getWordHistory", () => {
  it("should return empty object when nothing stored", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const history = await getWordHistory();
    expect(history).toEqual({});
  });

  it("should parse stored history", async () => {
    const stored = { comida: ["pizza", "hamburguesa"] };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stored));
    const history = await getWordHistory();
    expect(history).toEqual(stored);
  });

  it("should return empty object on parse error", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("invalid-json");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const history = await getWordHistory();
    expect(history).toEqual({});
    consoleSpy.mockRestore();
  });
});

describe("getUsedWords", () => {
  it("should return words for existing category", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ comida: ["pizza"] })
    );
    const words = await getUsedWords("comida");
    expect(words).toEqual(["pizza"]);
  });

  it("should return empty array for unknown category", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ comida: ["pizza"] })
    );
    const words = await getUsedWords("películas");
    expect(words).toEqual([]);
  });
});

describe("addUsedWord", () => {
  it("should add word to new category", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({}));
    await addUsedWord("comida", "Pizza");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "impostar-word-history",
      JSON.stringify({ comida: ["pizza"] })
    );
  });

  it("should add word to existing category", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ comida: ["pizza"] })
    );
    await addUsedWord("comida", "Hamburguesa");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "impostar-word-history",
      JSON.stringify({ comida: ["pizza", "hamburguesa"] })
    );
  });

  it("should not add duplicate word (case insensitive)", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ comida: ["pizza"] })
    );
    await addUsedWord("comida", "PIZZA");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("should normalize words (trim + lowercase)", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({}));
    await addUsedWord("comida", "  Pizza  ");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "impostar-word-history",
      JSON.stringify({ comida: ["pizza"] })
    );
  });
});

describe("isWordUsed", () => {
  it("should return true for used word", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ comida: ["pizza"] })
    );
    expect(await isWordUsed("comida", "Pizza")).toBe(true);
  });

  it("should return false for unused word", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ comida: ["pizza"] })
    );
    expect(await isWordUsed("comida", "Hamburguesa")).toBe(false);
  });
});

describe("getAvailableWords", () => {
  it("should filter out used words", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ comida: ["pizza", "hamburguesa"] })
    );
    const available = await getAvailableWords("comida", [
      "Pizza",
      "Hamburguesa",
      "Empanada",
    ]);
    expect(available).toEqual(["Empanada"]);
  });

  it("should return all words when none used", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({}));
    const all = ["Pizza", "Hamburguesa"];
    const available = await getAvailableWords("comida", all);
    expect(available).toEqual(all);
  });
});

describe("clearHistory", () => {
  it("should remove the storage key", async () => {
    await clearHistory();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("impostar-word-history");
  });
});

describe("clearCategoryHistory", () => {
  it("should remove only the specified category", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ comida: ["pizza"], películas: ["titanic"] })
    );
    await clearCategoryHistory("comida");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "impostar-word-history",
      JSON.stringify({ películas: ["titanic"] })
    );
  });
});

describe("clearAllAppData", () => {
  it("should remove word history, setup, and AI words keys", async () => {
    await clearAllAppData();
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      "impostar-word-history",
      "impostar-setup",
      "impostar-ai-words",
    ]);
  });
});
