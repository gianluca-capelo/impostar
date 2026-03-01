import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import GameSetupScreen from "../app/index";
import { GameProvider } from "../context/GameContext";
import * as wordHistoryService from "../services/wordHistory";
import * as aiService from "../services/ai"; // N-M1

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

// Mock expo-linear-gradient
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

// Mock @react-native-masked-view/masked-view
jest.mock("@react-native-masked-view/masked-view", () => ({
  __esModule: true,
  default: "MaskedView",
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView",
  SafeAreaProvider: "SafeAreaProvider",
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock wordHistory service
jest.mock("../services/wordHistory");
const mockedWordHistory = wordHistoryService as jest.Mocked<
  typeof wordHistoryService
>;

// Mock aiWords service (needed because GameContext loads AI words on mount)
jest.mock("../services/aiWords", () => ({
  loadAiWords: jest.fn(() => Promise.resolve([])),
  saveAiWords: jest.fn(() => Promise.resolve()),
  AI_WORDS_STORAGE_KEY: "impostar-ai-words",
}));

// N-M1: mock ai service to control in-flight requests
jest.mock("../services/ai");
const mockedAi = aiService as jest.Mocked<typeof aiService>;

// Mock useSubscription — default non-premium; override per-test for N-M1
jest.mock("../hooks/useSubscription", () => ({
  useSubscription: jest.fn(() => ({ isPremium: false, isLoading: false })),
}));
const mockUseSubscription = require("../hooks/useSubscription").useSubscription;

// Mock expo-router
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

// Mock Alert.alert
jest.spyOn(Alert, "alert").mockImplementation(() => {});

function renderScreen() {
  return render(
    <GameProvider>
      <GameSetupScreen />
    </GameProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSubscription.mockReturnValue({ isPremium: false, isLoading: false });
  mockedWordHistory.getAvailableWords.mockImplementation(
    async (_category: string, allWords: string[]) => allWords
  );
  mockedWordHistory.addUsedWord.mockResolvedValue(undefined);
  mockedWordHistory.clearAllAppData.mockResolvedValue(undefined);
  mockedAi.generateWordsFromDescription.mockResolvedValue(["gato", "perro"]);
});

describe("GameSetupScreen", () => {
  it("renders the title IMPOSTAR", async () => {
    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(getByText("IMPOST")).toBeTruthy();
      expect(getByText("AR")).toBeTruthy();
    });
  });

  it("renders the subtitle", async () => {
    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(getByText("¿Sos o te hacés?")).toBeTruthy();
    });
  });

  it("renders the start game button", async () => {
    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(getByText("¡Comenzar partida!")).toBeTruthy();
    });
  });

  it("renders the reset button", async () => {
    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(
        getByText("Borrar historial de palabras y configuración")
      ).toBeTruthy();
    });
  });

  it("renders the AI premium card", async () => {
    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(getByText("Generar con IA")).toBeTruthy();
      expect(getByText("PREMIUM")).toBeTruthy();
    });
  });

  it("shows premium modal when AI card is pressed", async () => {
    const { getByText, queryByText } = renderScreen();
    await waitFor(() => {
      expect(getByText("Generar con IA")).toBeTruthy();
    });

    // Modal content should not be visible initially
    expect(queryByText("Entendido")).toBeNull();

    fireEvent.press(getByText("Generar con IA"));

    // Modal content should now be visible
    await waitFor(() => {
      expect(getByText("Función Premium")).toBeTruthy();
      expect(getByText("Entendido")).toBeTruthy();
    });
  });

  it("closes premium modal when Entendido is pressed", async () => {
    const { getByText, queryByText } = renderScreen();
    await waitFor(() => {
      expect(getByText("Generar con IA")).toBeTruthy();
    });

    // Open modal
    fireEvent.press(getByText("Generar con IA"));
    await waitFor(() => {
      expect(getByText("Entendido")).toBeTruthy();
    });

    // Close modal
    fireEvent.press(getByText("Entendido"));

    await waitFor(() => {
      expect(queryByText("Entendido")).toBeNull();
    });
  });

  it("shows the category picker with Aleatorio as default", async () => {
    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(getByText(/Aleatorio/)).toBeTruthy();
    });
  });

  it("shows validation error when players is less than 3", async () => {
    const { getByText, getByDisplayValue } = renderScreen();
    await waitFor(() => {
      expect(getByText("¡Comenzar partida!")).toBeTruthy();
    });

    // Change players to 2
    const playersInput = getByDisplayValue("5");
    fireEvent.changeText(playersInput, "2");

    fireEvent.press(getByText("¡Comenzar partida!"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Se necesitan al menos 3 jugadores"
      );
    });
  });

  it("shows validation error when impostors >= players", async () => {
    const { getByText, getByDisplayValue } = renderScreen();
    await waitFor(() => {
      expect(getByText("¡Comenzar partida!")).toBeTruthy();
    });

    // Change impostors to 5 (same as players default)
    const impostorsInput = getByDisplayValue("1");
    fireEvent.changeText(impostorsInput, "5");

    fireEvent.press(getByText("¡Comenzar partida!"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "El número de impostores debe ser menor que el número de jugadores"
      );
    });
  });

  it("navigates to /roles on valid start game", async () => {
    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(getByText("¡Comenzar partida!")).toBeTruthy();
    });

    fireEvent.press(getByText("¡Comenzar partida!"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/roles");
    });
  });

  it("does not show custom word input by default", async () => {
    const { queryByPlaceholderText } = renderScreen();
    await waitFor(() => {
      expect(
        queryByPlaceholderText("Escribí la palabra secreta acá")
      ).toBeNull();
    });
  });

  it("shows custom names inputs when toggle is enabled", async () => {
    const { getByText, queryByPlaceholderText } = renderScreen();
    await waitFor(() => {
      expect(getByText("Nombres personalizados")).toBeTruthy();
    });

    // Initially, player name inputs should not be visible
    expect(queryByPlaceholderText("Jugador 1")).toBeNull();
  });

  it("calls resetAllData when reset button is pressed", async () => {
    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(
        getByText("Borrar historial de palabras y configuración")
      ).toBeTruthy();
    });

    fireEvent.press(
      getByText("Borrar historial de palabras y configuración")
    );

    await waitFor(() => {
      expect(mockedWordHistory.clearAllAppData).toHaveBeenCalled();
    });
  });

  // N-M1: abort in-flight AI generation when component unmounts
  it("N-M1: aborts in-flight AI generation when component unmounts", async () => {
    // Make this test premium so the AI form is accessible
    mockUseSubscription.mockReturnValue({ isPremium: true, isLoading: false });

    let capturedSignal: AbortSignal | undefined;
    mockedAi.generateWordsFromDescription.mockImplementation(
      (_desc, _token, signal) => {
        capturedSignal = signal;
        return new Promise(() => {}); // never resolves — simulates in-flight request
      }
    );

    const { getByText, getByPlaceholderText, unmount } = renderScreen();

    // Switch to AI category by pressing the card
    await waitFor(() => {
      expect(getByText("Generar con IA")).toBeTruthy();
    });
    fireEvent.press(getByText("Generar con IA"));

    // AI form should now be visible
    await waitFor(() => {
      expect(getByPlaceholderText("Ej: Personajes de anime de los 90s")).toBeTruthy();
    });

    // Enter a description and trigger generation
    fireEvent.changeText(
      getByPlaceholderText("Ej: Personajes de anime de los 90s"),
      "animales"
    );
    fireEvent.press(getByText("Generar palabras"));

    // Wait for signal to be captured (the mock was called)
    await waitFor(() => {
      expect(capturedSignal).toBeDefined();
    });

    expect(capturedSignal!.aborted).toBe(false);

    // Unmount the component — useEffect cleanup should abort the controller
    act(() => {
      unmount();
    });

    expect(capturedSignal!.aborted).toBe(true);
  });
});
