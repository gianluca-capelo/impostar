import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AiGenerationFormProps {
  description: string;
  onDescriptionChange: (text: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generatedWords: string[];
  onUsePredefinedCategory: () => void;
}

export function AiGenerationForm({
  description,
  onDescriptionChange,
  onGenerate,
  isGenerating,
  generatedWords,
  onUsePredefinedCategory,
}: AiGenerationFormProps) {
  const [showWords, setShowWords] = useState(false);
  const isButtonDisabled = isGenerating || !description.trim();

  return (
    <View className="gap-4">
      {/* Label */}
      <View className="flex-row items-center gap-2">
        <Ionicons name="sparkles" size={16} color="#38bdf8" />
        <Text className="text-base font-medium text-primary">
          Describí tu categoría
        </Text>
      </View>

      {/* Description input */}
      <TextInput
        value={description}
        onChangeText={onDescriptionChange}
        placeholder="Ej: Personajes de anime de los 90s"
        placeholderTextColor="#94a3b8"
        maxLength={200}
        editable={!isGenerating}
        className="bg-surface border border-border rounded-xl px-4 py-3 text-primary text-lg"
      />
      <Text className="text-sm text-secondary -mt-2">
        La IA generará palabras basadas en tu descripción ({description.length}
        /200)
      </Text>

      {/* Generate button */}
      <Pressable
        onPress={onGenerate}
        disabled={isButtonDisabled}
        className={`rounded-xl py-3.5 items-center flex-row justify-center gap-2 ${
          isButtonDisabled ? "bg-accent/40" : "bg-accent"
        }`}
      >
        {isGenerating ? (
          <>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text className="text-white text-base font-bold">Generando...</Text>
          </>
        ) : (
          <>
            <Ionicons name="sparkles" size={18} color="#ffffff" />
            <Text className="text-white text-base font-bold">
              Generar palabras
            </Text>
          </>
        )}
      </Pressable>

      {/* Generated words display */}
      {generatedWords.length > 0 && (
        <Pressable
          onPress={() => setShowWords(!showWords)}
          className="bg-surface/50 border border-border rounded-xl p-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
              <Text className="text-sm font-medium text-primary">
                {generatedWords.length} palabras generadas
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons
                name={showWords ? "eye-off-outline" : "eye-outline"}
                size={16}
                color="#94a3b8"
              />
              <Text className="text-sm text-secondary">
                {showWords ? "Ocultar" : "Ver"}
              </Text>
            </View>
          </View>

          {showWords && (
            <View className="flex-row flex-wrap gap-2 mt-3">
              {generatedWords.map((word, index) => (
                <View
                  key={index}
                  className="bg-accent/10 rounded-lg px-2.5 py-1"
                >
                  <Text className="text-sm text-accent">{word}</Text>
                </View>
              ))}
            </View>
          )}
        </Pressable>
      )}

      {/* Use predefined category button */}
      <Pressable
        onPress={onUsePredefinedCategory}
        className="py-2 items-center"
      >
        <Text className="text-secondary text-[15px]">
          Usar categoría predefinida en su lugar
        </Text>
      </Pressable>
    </View>
  );
}
