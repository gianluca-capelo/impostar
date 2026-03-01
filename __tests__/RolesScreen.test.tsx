import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import RolesScreen from "../app/roles";

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

// Mock expo-router
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

// Mock GameContext
const mockNextPlayer = jest.fn();
const mockResetGame = jest.fn();
const mockStartNewRound = jest.fn();
const mockStartNewRoundSameCategory = jest.fn();

let mockGameState = {
  players: [
    { id: 0, name: "Ana", isImpostor: false },
    { id: 1, name: "Bruno", isImpostor: true },
    { id: 2, name: "Carlos", isImpostor: false },
  ],
  numberOfPlayers: 3,
  numberOfImpostors: 1,
  secretWord: "Pizza",
  category: "comida" as const,
  phase: "roles" as const,
  currentPlayerIndex: 0,
};

jest.mock("../context/GameContext", () => ({
  useGame: () => ({
    gameState: mockGameState,
    nextPlayer: mockNextPlayer,
    resetGame: mockResetGame,
    startNewRound: mockStartNewRound,
    startNewRoundSameCategory: mockStartNewRoundSameCategory,
  }),
}));

jest.spyOn(Alert, "alert").mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
  mockGameState = {
    players: [
      { id: 0, name: "Ana", isImpostor: false },
      { id: 1, name: "Bruno", isImpostor: true },
      { id: 2, name: "Carlos", isImpostor: false },
    ],
    numberOfPlayers: 3,
    numberOfImpostors: 1,
    secretWord: "Pizza",
    category: "comida" as const,
    phase: "roles" as const,
    currentPlayerIndex: 0,
  };
});

describe("RolesScreen", () => {
  describe("Privacy Screen", () => {
    it("renders player name and progress", () => {
      const { getAllByText, getByText } = render(<RolesScreen />);

      expect(getAllByText(/Ana/).length).toBeGreaterThanOrEqual(1);
      expect(getByText("Jugador 1 de 3")).toBeTruthy();
    });

    it("renders privacy warning", () => {
      const { getByText } = render(<RolesScreen />);

      expect(getByText("Privacidad importante")).toBeTruthy();
    });

    it("renders the reveal button", () => {
      const { getByText } = render(<RolesScreen />);

      expect(getByText("Listo, ver mi rol")).toBeTruthy();
    });

    it("does not show the secret word", () => {
      const { queryByText } = render(<RolesScreen />);

      expect(queryByText("Pizza")).toBeNull();
    });
  });

  describe("Role Reveal - Civil", () => {
    it("shows civil role and secret word after tapping reveal", () => {
      const { getByText } = render(<RolesScreen />);

      fireEvent.press(getByText("Listo, ver mi rol"));

      expect(getByText("SOS CIVIL")).toBeTruthy();
      expect(getByText("Pizza")).toBeTruthy();
      expect(getByText("Palabra secreta:")).toBeTruthy();
    });

    it("shows next player button text", () => {
      const { getByText } = render(<RolesScreen />);

      fireEvent.press(getByText("Listo, ver mi rol"));

      expect(getByText("Ocultar y pasar al siguiente")).toBeTruthy();
    });

    it("calls nextPlayer when tapping next", () => {
      const { getByText } = render(<RolesScreen />);

      fireEvent.press(getByText("Listo, ver mi rol"));
      fireEvent.press(getByText("Ocultar y pasar al siguiente"));

      expect(mockNextPlayer).toHaveBeenCalledTimes(1);
    });
  });

  describe("Role Reveal - Impostor", () => {
    beforeEach(() => {
      mockGameState = {
        ...mockGameState,
        currentPlayerIndex: 1, // Bruno is impostor
      };
    });

    it("shows impostor role and hides secret word", () => {
      const { getByText, queryByText } = render(<RolesScreen />);

      fireEvent.press(getByText("Listo, ver mi rol"));

      expect(getByText("SOS IMPOSTOR")).toBeTruthy();
      expect(queryByText("Pizza")).toBeNull();
      expect(getByText(/No conocés la palabra secreta/)).toBeTruthy();
    });
  });

  describe("Last Player", () => {
    beforeEach(() => {
      mockGameState = {
        ...mockGameState,
        currentPlayerIndex: 2, // Carlos is last (index 2 of 3)
      };
    });

    it("shows 'Finalizar asignación' for last player", () => {
      const { getByText } = render(<RolesScreen />);

      fireEvent.press(getByText("Listo, ver mi rol"));

      expect(getByText("Finalizar asignación")).toBeTruthy();
    });
  });

  describe("Complete Screen", () => {
    beforeEach(() => {
      mockGameState = {
        ...mockGameState,
        phase: "complete" as const,
      };
    });

    it("renders the completion title", () => {
      const { getByText } = render(<RolesScreen />);

      expect(getByText("¡Todos tienen su rol!")).toBeTruthy();
    });

    it("renders game summary", () => {
      const { getByText } = render(<RolesScreen />);

      expect(getByText("Total de jugadores")).toBeTruthy();
      expect(getByText("3")).toBeTruthy();
      expect(getByText("Número de impostores")).toBeTruthy();
      expect(getByText("1")).toBeTruthy();
      expect(getByText("Categoría")).toBeTruthy();
      expect(getByText(/Comida/)).toBeTruthy();
    });

    it("renders game rules", () => {
      const { getByText } = render(<RolesScreen />);

      expect(
        getByText(/Los civiles deben dar pistas/)
      ).toBeTruthy();
      expect(
        getByText(/Los impostores deben intentar sonar convincentes/)
      ).toBeTruthy();
    });

    it("calls startNewRoundSameCategory when pressing 'Misma categoría'", async () => {
      mockStartNewRoundSameCategory.mockResolvedValue(undefined);
      const { getByText } = render(<RolesScreen />);

      await act(async () => {
        fireEvent.press(getByText("Misma categoría"));
      });

      expect(mockStartNewRoundSameCategory).toHaveBeenCalledTimes(1);
    });

    it("C-2: shows alert when startNewRoundSameCategory fails", async () => {
      mockStartNewRoundSameCategory.mockRejectedValue(new Error("network error"));
      const { getByText } = render(<RolesScreen />);

      await act(async () => {
        fireEvent.press(getByText("Misma categoría"));
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "No se pudo iniciar la nueva ronda. Intenta de nuevo."
      );
    });

    it("calls startNewRound and navigates back when pressing 'Nueva ronda'", () => {
      const { getByText } = render(<RolesScreen />);

      fireEvent.press(getByText("Nueva ronda"));

      expect(mockStartNewRound).toHaveBeenCalledTimes(1);
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("calls resetGame and navigates back when pressing 'Volver al inicio'", () => {
      const { getByText } = render(<RolesScreen />);

      fireEvent.press(getByText("Volver al inicio"));

      expect(mockResetGame).toHaveBeenCalledTimes(1);
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });
});
