import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SettingsScreen from "../app/settings";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView",
  SafeAreaProvider: "SafeAreaProvider",
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SettingsScreen", () => {
  it("renders the title", () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText("Configuración")).toBeTruthy();
  });

  it("renders both navigation cards", () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText("Ayuda / FAQ")).toBeTruthy();
    expect(getByText("Política de privacidad")).toBeTruthy();
  });

  it("navigates back when pressing back button", () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText("Volver"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("navigates to FAQ when pressing Ayuda / FAQ", () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText("Ayuda / FAQ"));
    expect(mockPush).toHaveBeenCalledWith("/faq");
  });

  it("navigates to Privacy when pressing Política de privacidad", () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText("Política de privacidad"));
    expect(mockPush).toHaveBeenCalledWith("/privacy");
  });
});
