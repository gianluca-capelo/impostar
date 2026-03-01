import { useState, useCallback } from "react";
import {
  getAvailableWords as getAvailableWordsFromService,
  addUsedWord,
  isWordUsed as checkIsWordUsed,
  clearHistory,
  getWordHistory,
} from "../services/wordHistory";

export function useWordHistory() {
  // State to trigger re-renders when history changes
  const [, setVersion] = useState(0);

  const refreshHistory = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const isWordUsed = useCallback(async (category: string, word: string): Promise<boolean> => {
    return await checkIsWordUsed(category, word);
  }, []);

  const markWordAsUsed = useCallback(
    async (category: string, word: string): Promise<void> => {
      await addUsedWord(category, word);
      refreshHistory();
    },
    [refreshHistory]
  );

  const getAvailableWords = useCallback(
    async (category: string, allWords: string[]): Promise<string[]> => {
      return await getAvailableWordsFromService(category, allWords);
    },
    []
  );

  const resetHistory = useCallback(async (): Promise<void> => {
    await clearHistory();
    refreshHistory();
  }, [refreshHistory]);

  const getTotalUsedWords = useCallback(async (): Promise<number> => {
    const history = await getWordHistory();
    return Object.values(history).reduce((total, words) => total + words.length, 0);
  }, []);

  return {
    isWordUsed,
    markWordAsUsed,
    getAvailableWords,
    resetHistory,
    getTotalUsedWords,
  };
}
