import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import GameSetupScreen from "../app/index";
import { GameProvider } from "../context/GameContext";
import * as wordHistoryService from "../services/wordHistory";

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
  mockedWordHistory.getAvailableWords.mockImplementation(
    async (_category: string, allWords: string[]) => allWords
  );
  mockedWordHistory.addUsedWord.mockResolvedValue(undefined);
  mockedWordHistory.clearAllAppData.mockResolvedValue(undefined);
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

  it("shows premium alert when AI card is pressed", async () => {
    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(getByText("Generar con IA")).toBeTruthy();
    });

    fireEvent.press(getByText("Generar con IA"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Función Premium",
      "La generación de palabras con IA estará disponible en una futura actualización."
    );
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
});
