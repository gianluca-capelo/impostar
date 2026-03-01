import AsyncStorage from "@react-native-async-storage/async-storage";
import { SETUP_STORAGE_KEY } from "./gameSetup";
import { AI_WORDS_STORAGE_KEY } from "./aiWords";

const STORAGE_KEY = "impostar-word-history";

export interface WordHistoryData {
  [category: string]: string[];
}

function normalizeWord(word: string): string {
  return word.toLowerCase().trim();
}

export async function getWordHistory(): Promise<WordHistoryData> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading word history:", error);
  }
  return {};
}

export async function getUsedWords(category: string): Promise<string[]> {
  const history = await getWordHistory();
  return history[category] || [];
}

export async function addUsedWord(category: string, word: string): Promise<void> {
  const history = await getWordHistory();
  const normalizedWord = normalizeWord(word);

  if (!history[category]) {
    history[category] = [];
  }

  if (!history[category].includes(normalizedWord)) {
    history[category].push(normalizedWord);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}

export async function isWordUsed(category: string, word: string): Promise<boolean> {
  const usedWords = await getUsedWords(category);
  return usedWords.includes(normalizeWord(word));
}

export async function getAvailableWords(category: string, allWords: string[]): Promise<string[]> {
  const usedWords = await getUsedWords(category);
  return allWords.filter((word) => !usedWords.includes(normalizeWord(word)));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function clearCategoryHistory(category: string): Promise<void> {
  const history = await getWordHistory();
  delete history[category];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export async function clearAllAppData(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEY, SETUP_STORAGE_KEY, AI_WORDS_STORAGE_KEY]);
}
