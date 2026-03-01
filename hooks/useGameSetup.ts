import { useState, useEffect, useCallback, useRef } from "react";
import {
  GameSetupData,
  DEFAULT_SETUP,
  getStoredSetup,
  saveSetup,
  clearSetup as clearStoredSetup,
} from "../services/gameSetup";

export function useGameSetup() {
  const [setup, setSetup] = useState<GameSetupData>(DEFAULT_SETUP);
  const [isLoaded, setIsLoaded] = useState(false);
  const isLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted setup from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const stored = await getStoredSetup();
      setSetup(stored);
      setIsLoaded(true);
      isLoadedRef.current = true;
    })();
  }, []);

  // Auto-save to AsyncStorage whenever setup changes (only after initial load, debounced)
  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveSetup(setup), 300);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [setup]);

  const setNumberOfPlayers = useCallback((value: string) => {
    setSetup((prev) => {
      const count = parseInt(value) || 0;
      const newNames = [...prev.playerNames];
      while (newNames.length < count) newNames.push("");
      return {
        ...prev,
        numberOfPlayers: value,
        playerNames: newNames.slice(0, count),
      };
    });
  }, []);

  const setNumberOfImpostors = useCallback((value: string) => {
    setSetup((prev) => ({ ...prev, numberOfImpostors: value }));
  }, []);

  const setUseCustomNames = useCallback((value: boolean) => {
    setSetup((prev) => ({ ...prev, useCustomNames: value }));
  }, []);

  const setPlayerName = useCallback((index: number, name: string) => {
    setSetup((prev) => {
      const newNames = [...prev.playerNames];
      newNames[index] = name;
      return { ...prev, playerNames: newNames };
    });
  }, []);

  const clearSetup = useCallback(async () => {
    await clearStoredSetup();
    setSetup(DEFAULT_SETUP);
  }, []);

  return {
    numberOfPlayers: setup.numberOfPlayers,
    numberOfImpostors: setup.numberOfImpostors,
    useCustomNames: setup.useCustomNames,
    playerNames: setup.playerNames,
    isLoaded,
    setNumberOfPlayers,
    setNumberOfImpostors,
    setUseCustomNames,
    setPlayerName,
    clearSetup,
  };
}
