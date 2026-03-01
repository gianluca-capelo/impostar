import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PrivacyScreen from "../app/privacy";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView",
  SafeAreaProvider: "SafeAreaProvider",
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PrivacyScreen", () => {
  it("renders the title and subtitle", () => {
    const { getByText } = render(<PrivacyScreen />);
    expect(getByText("Política de Privacidad")).toBeTruthy();
    expect(getByText(/Diciembre 2025/)).toBeTruthy();
  });

  it("renders all section headings", () => {
    const { getByText } = render(<PrivacyScreen />);
    expect(getByText("Introducción")).toBeTruthy();
    expect(getByText("Datos que NO recopilamos")).toBeTruthy();
    expect(getByText("Almacenamiento local")).toBeTruthy();
    expect(getByText("Generación de palabras con IA")).toBeTruthy();
    expect(getByText("Nombres de jugadores")).toBeTruthy();
    expect(getByText("Servicios de terceros")).toBeTruthy();
    expect(getByText("Cambios en esta política")).toBeTruthy();
  });

  it("renders key content from sections", () => {
    const { getByText } = render(<PrivacyScreen />);
    expect(getByText(/no recopila, almacena ni transmite/)).toBeTruthy();
    expect(getByText(/permanecen únicamente en tu dispositivo/)).toBeTruthy();
  });

  it("renders the footer", () => {
    const { getByText } = render(<PrivacyScreen />);
    expect(
      getByText(/efectiva a partir de diciembre de 2025/)
    ).toBeTruthy();
  });

  it("navigates back when pressing back button", () => {
    const { getByText } = render(<PrivacyScreen />);
    fireEvent.press(getByText("Volver"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
