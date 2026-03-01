import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGame } from "../context/GameContext";
import { useGameSetup } from "../hooks/useGameSetup";
import { useSubscription } from "../hooks/useSubscription";
import { WordCategory } from "../types/game";
import { validateGameSetup } from "../utils/validation";
import { generateWordsFromDescription } from "../services/ai";
import { GameTitle } from "../components/GameTitle";
import { AiPremiumCard } from "../components/AiPremiumCard";
import { AiGenerationForm } from "../components/AiGenerationForm";
import { PremiumFeatureModal } from "../components/PremiumFeatureModal";
import { CategoryPicker } from "../components/CategoryPicker";
import { PlayerConfig } from "../components/PlayerConfig";

export default function GameSetupScreen() {
  const router = useRouter();
  const { aiGeneratedWords, setAiGeneratedWords, startGame, resetAllData } =
    useGame();
  const {
    numberOfPlayers,
    numberOfImpostors,
    useCustomNames,
    playerNames,
    isLoaded,
    setNumberOfPlayers,
    setNumberOfImpostors,
    setUseCustomNames,
    setPlayerName,
    clearSetup,
  } = useGameSetup();
  const { isPremium } = useSubscription();

  const [category, setCategory] = useState<WordCategory>("aleatorio");
  const [customWord, setCustomWord] = useState("");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiCardPress = () => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setCategory(category === "ia_generado" ? "aleatorio" : "ia_generado");
  };

  const handleGenerateWords = async () => {
    if (!aiDescription.trim()) {
      Alert.alert("Error", "Escribí una descripción para generar palabras");
      return;
    }
    setIsGenerating(true);
    try {
      const words = await generateWordsFromDescription(aiDescription);
      setAiGeneratedWords(words);
      Alert.alert("¡Listo!", `Se generaron ${words.length} palabras`);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Error al generar palabras"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUsePredefinedCategory = () => {
    setCategory("aleatorio");
    setAiDescription("");
    setAiGeneratedWords([]);
  };

  const handleStartGame = async () => {
    const error = validateGameSetup({
      numberOfPlayers,
      numberOfImpostors,
      category,
      customWord,
      aiGeneratedWordsCount: aiGeneratedWords.length,
    });

    if (error) {
      Alert.alert("Error", error);
      return;
    }

    const players = parseInt(numberOfPlayers);
    const impostors = parseInt(numberOfImpostors);
    const names = useCustomNames ? playerNames : undefined;

    await startGame(players, impostors, names, category, customWord);
    router.push("/roles");
  };

  const handleReset = async () => {
    await resetAllData();
    await clearSetup();
    setCategory("aleatorio");
    setCustomWord("");
    setAiDescription("");
  };

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-secondary">Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-10"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with settings icon */}
          <View className="flex-row justify-between items-center pt-2">
            <Pressable
              onPress={() => router.push("/settings")}
              className="p-2 -ml-2"
            >
              <Ionicons name="settings-outline" size={22} color="#94a3b8" />
            </Pressable>
            <View />
          </View>

          {/* Title */}
          <GameTitle />

          {/* Content */}
          <View className="gap-6 mt-2">
            {/* AI Premium Card */}
            <AiPremiumCard
              onPress={handleAiCardPress}
              isActive={category === "ia_generado"}
              isLocked={!isPremium}
            />

            {/* AI Generation Form — visible when premium + ia_generado */}
            {isPremium && category === "ia_generado" && (
              <AiGenerationForm
                description={aiDescription}
                onDescriptionChange={setAiDescription}
                onGenerate={handleGenerateWords}
                isGenerating={isGenerating}
                generatedWords={aiGeneratedWords}
                onUsePredefinedCategory={handleUsePredefinedCategory}
              />
            )}

            {/* Separator — hidden when ia_generado is active */}
            {category !== "ia_generado" && (
              <View className="flex-row items-center py-1">
                <View className="flex-1 h-px bg-border" />
                <Text className="px-4 text-[15px] text-secondary">
                  o elegí una categoría
                </Text>
                <View className="flex-1 h-px bg-border" />
              </View>
            )}

            {/* Category Picker — hidden when ia_generado is active */}
            {category !== "ia_generado" && (
              <CategoryPicker
                selectedCategory={category}
                onSelectCategory={setCategory}
              />
            )}

            {/* Custom word input */}
            {category === "personalizado" && (
              <View className="gap-2">
                <Text className="text-base text-primary font-medium">
                  Palabra secreta
                </Text>
                <TextInput
                  value={customWord}
                  onChangeText={setCustomWord}
                  placeholder="Escribí la palabra secreta acá"
                  placeholderTextColor="#94a3b8"
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-primary text-lg"
                />
                <Text className="text-[15px] text-secondary">
                  Esta palabra será visible solo para los civiles
                </Text>
              </View>
            )}

            {/* Player config separator */}
            <View className="flex-row items-center py-2">
              <View className="flex-1 h-px bg-border" />
              <Text className="px-4 text-xs text-secondary font-medium uppercase tracking-wider">
                configuración de jugadores
              </Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Player Configuration */}
            <PlayerConfig
              numberOfPlayers={numberOfPlayers}
              numberOfImpostors={numberOfImpostors}
              useCustomNames={useCustomNames}
              playerNames={playerNames}
              onPlayersChange={setNumberOfPlayers}
              onImpostorsChange={setNumberOfImpostors}
              onCustomNamesToggle={setUseCustomNames}
              onPlayerNameChange={setPlayerName}
            />

            {/* Start Game Button */}
            <Pressable
              onPress={handleStartGame}
              className="bg-accent rounded-2xl py-4 items-center mt-2"
            >
              <Text className="text-white text-xl font-bold">
                ¡Comenzar partida!
              </Text>
            </Pressable>

            {/* Reset Button */}
            <Pressable onPress={handleReset} className="py-3 items-center">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="refresh-outline"
                  size={16}
                  color="#94a3b8"
                />
                <Text className="text-secondary text-[15px]">
                  Borrar historial de palabras y configuración
                </Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PremiumFeatureModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </SafeAreaView>
  );
}
