import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { AiGenerationForm } from "../components/AiGenerationForm";

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const defaultProps = {
  description: "",
  onDescriptionChange: jest.fn(),
  onGenerate: jest.fn(),
  isGenerating: false,
  generatedWords: [] as string[],
  onUsePredefinedCategory: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AiGenerationForm", () => {
  it("renders the description input with placeholder", () => {
    const { getByPlaceholderText } = render(
      <AiGenerationForm {...defaultProps} />
    );

    expect(
      getByPlaceholderText("Ej: Personajes de anime de los 90s")
    ).toBeTruthy();
  });

  it("renders the generate button", () => {
    const { getByText } = render(<AiGenerationForm {...defaultProps} />);

    expect(getByText("Generar palabras")).toBeTruthy();
  });

  it("renders the label", () => {
    const { getByText } = render(<AiGenerationForm {...defaultProps} />);

    expect(getByText("Describí tu categoría")).toBeTruthy();
  });

  it("shows character count", () => {
    const { getByText } = render(
      <AiGenerationForm {...defaultProps} description="Frutas tropicales" />
    );

    expect(getByText(/17/)).toBeTruthy();
    expect(getByText(/\/200/)).toBeTruthy();
  });

  it("calls onDescriptionChange when typing", () => {
    const { getByPlaceholderText } = render(
      <AiGenerationForm {...defaultProps} />
    );

    fireEvent.changeText(
      getByPlaceholderText("Ej: Personajes de anime de los 90s"),
      "Frutas"
    );

    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith("Frutas");
  });

  it("calls onGenerate when button is pressed with description", () => {
    const { getByText } = render(
      <AiGenerationForm {...defaultProps} description="Frutas tropicales" />
    );

    fireEvent.press(getByText("Generar palabras"));

    expect(defaultProps.onGenerate).toHaveBeenCalledTimes(1);
  });

  it("shows loading state when generating", () => {
    const { getByText } = render(
      <AiGenerationForm
        {...defaultProps}
        description="Frutas"
        isGenerating={true}
      />
    );

    expect(getByText("Generando...")).toBeTruthy();
  });

  it("renders generated words section when words exist", () => {
    const words = ["Mango", "Papaya", "Kiwi"];
    const { getByText } = render(
      <AiGenerationForm {...defaultProps} generatedWords={words} />
    );

    expect(getByText("3 palabras generadas")).toBeTruthy();
  });

  it("toggles word visibility when words section is pressed", () => {
    const words = ["Mango", "Papaya", "Kiwi"];
    const { getByText, queryByText } = render(
      <AiGenerationForm {...defaultProps} generatedWords={words} />
    );

    // Words are hidden by default
    expect(queryByText("Mango")).toBeNull();

    // Toggle to show
    fireEvent.press(getByText("3 palabras generadas"));

    expect(getByText("Mango")).toBeTruthy();
    expect(getByText("Papaya")).toBeTruthy();
    expect(getByText("Kiwi")).toBeTruthy();
  });

  it("calls onUsePredefinedCategory when button is pressed", () => {
    const { getByText } = render(<AiGenerationForm {...defaultProps} />);

    fireEvent.press(getByText("Usar categoría predefinida en su lugar"));

    expect(defaultProps.onUsePredefinedCategory).toHaveBeenCalledTimes(1);
  });

  it("renders the predefined category button", () => {
    const { getByText } = render(<AiGenerationForm {...defaultProps} />);

    expect(
      getByText("Usar categoría predefinida en su lugar")
    ).toBeTruthy();
  });
});
