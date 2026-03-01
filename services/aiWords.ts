// M-1: Persistence of AI-generated words across app restarts.
// Follows the same pattern as services/wordHistory.ts.
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AI_WORDS_STORAGE_KEY = "impostar-ai-words";

export async function loadAiWords(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(AI_WORDS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading AI words:", error);
  }
  return [];
}

export async function saveAiWords(words: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(AI_WORDS_STORAGE_KEY, JSON.stringify(words));
  } catch (error) {
    console.error("Error saving AI words:", error);
  }
}
