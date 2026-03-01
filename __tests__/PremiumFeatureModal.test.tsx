import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { PremiumFeatureModal } from "../components/PremiumFeatureModal";

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const mockOnClose = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PremiumFeatureModal", () => {
  it("renders modal content when visible is true", () => {
    const { getByText } = render(
      <PremiumFeatureModal visible={true} onClose={mockOnClose} />
    );

    expect(getByText("Función Premium")).toBeTruthy();
    expect(
      getByText(
        /La generación de palabras con IA es una función exclusiva/
      )
    ).toBeTruthy();
    expect(getByText("Entendido")).toBeTruthy();
  });

  it("does not render modal content when visible is false", () => {
    const { queryByText } = render(
      <PremiumFeatureModal visible={false} onClose={mockOnClose} />
    );

    expect(queryByText("Función Premium")).toBeNull();
  });

  it("calls onClose when the close button is pressed", () => {
    const { getByText } = render(
      <PremiumFeatureModal visible={true} onClose={mockOnClose} />
    );

    fireEvent.press(getByText("Entendido"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("renders the future availability message", () => {
    const { getByText } = render(
      <PremiumFeatureModal visible={true} onClose={mockOnClose} />
    );

    expect(
      getByText(/Estará disponible en una futura actualización/)
    ).toBeTruthy();
  });
});
