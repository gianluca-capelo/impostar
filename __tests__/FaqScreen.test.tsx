import React from "react";
import { Linking } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import FaqScreen from "../app/faq";

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

jest.spyOn(Linking, "openURL").mockImplementation(() => Promise.resolve(true));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FaqScreen", () => {
  it("renders the title", () => {
    const { getByText } = render(<FaqScreen />);
    expect(getByText("Ayuda / FAQ")).toBeTruthy();
  });

  it("renders all three FAQ questions", () => {
    const { getByText } = render(<FaqScreen />);
    expect(
      getByText("¿Por qué mi compra no aparece en mi biblioteca?")
    ).toBeTruthy();
    expect(
      getByText("¿Cuándo se realizará el cargo en mi tarjeta?")
    ).toBeTruthy();
    expect(
      getByText("¿Cómo puedo cancelar mi suscripción?")
    ).toBeTruthy();
  });

  it("does not show answers initially", () => {
    const { queryByText } = render(<FaqScreen />);
    expect(queryByText(/procesamiento de tu compra/)).toBeNull();
    expect(queryByText(/gestionar tus suscripciones/)).toBeNull();
  });

  it("expands an item when pressed", () => {
    const { getByText, queryByText } = render(<FaqScreen />);
    fireEvent.press(
      getByText("¿Por qué mi compra no aparece en mi biblioteca?")
    );
    expect(queryByText(/procesamiento de tu compra/)).toBeTruthy();
  });

  it("collapses an item when pressed again", () => {
    const { getByText, queryByText } = render(<FaqScreen />);
    fireEvent.press(
      getByText("¿Por qué mi compra no aparece en mi biblioteca?")
    );
    expect(queryByText(/procesamiento de tu compra/)).toBeTruthy();
    fireEvent.press(
      getByText("¿Por qué mi compra no aparece en mi biblioteca?")
    );
    expect(queryByText(/procesamiento de tu compra/)).toBeNull();
  });

  it("allows multiple items to be expanded simultaneously", () => {
    const { getByText, queryByText } = render(<FaqScreen />);
    fireEvent.press(
      getByText("¿Por qué mi compra no aparece en mi biblioteca?")
    );
    fireEvent.press(getByText("¿Cómo puedo cancelar mi suscripción?"));
    expect(queryByText(/procesamiento de tu compra/)).toBeTruthy();
    expect(queryByText(/gestionar tus suscripciones/)).toBeTruthy();
  });

  it("renders contact section text", () => {
    const { getByText } = render(<FaqScreen />);
    expect(
      getByText("¿No has encontrado lo que buscabas?")
    ).toBeTruthy();
  });

  it("opens mailto link when pressing contact button", () => {
    const { getByText } = render(<FaqScreen />);
    fireEvent.press(getByText("Ponte en contacto"));
    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringContaining("mailto:broqui.apps@gmail.com")
    );
    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringContaining("Consulta%20desde%20Impostar")
    );
  });

  it("navigates back when pressing back button", () => {
    const { getByText } = render(<FaqScreen />);
    fireEvent.press(getByText("Volver a configuración"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
