import AsyncStorage from "@react-native-async-storage/async-storage";

export const SETUP_STORAGE_KEY = "impostar-setup";

export interface GameSetupData {
  numberOfPlayers: string;
  numberOfImpostors: string;
  useCustomNames: boolean;
  playerNames: string[];
}

export const DEFAULT_SETUP: GameSetupData = {
  numberOfPlayers: "5",
  numberOfImpostors: "1",
  useCustomNames: false,
  playerNames: [],
};

export async function getStoredSetup(): Promise<GameSetupData> {
  try {
    const stored = await AsyncStorage.getItem(SETUP_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETUP, ...parsed };
    }
  } catch (error) {
    console.error("Error reading game setup:", error);
  }
  return DEFAULT_SETUP;
}

export async function saveSetup(data: GameSetupData): Promise<void> {
  try {
    await AsyncStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving game setup:", error);
  }
}

export async function clearSetup(): Promise<void> {
  await AsyncStorage.removeItem(SETUP_STORAGE_KEY);
}
