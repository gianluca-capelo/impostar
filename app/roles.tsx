import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGame } from "../context/GameContext";
import { CATEGORY_OPTIONS } from "../utils/categories";

function getCategoryLabel(categoryValue: string): string {
  if (categoryValue === "ia_generado") return "🤖 Generado por IA";
  const option = CATEGORY_OPTIONS.find((c) => c.value === categoryValue);
  return option ? `${option.emoji} ${option.label}` : categoryValue;
}

export default function RolesScreen() {
  const router = useRouter();
  const {
    gameState,
    nextPlayer,
    resetGame,
    startNewRound,
    startNewRoundSameCategory,
  } = useGame();
  const [isRoleVisible, setIsRoleVisible] = useState(false);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isLastPlayer =
    gameState.currentPlayerIndex === gameState.numberOfPlayers - 1;

  // Reset isRoleVisible when a new round starts (secretWord changes)
  useEffect(() => {
    setIsRoleVisible(false);
  }, [gameState.secretWord]);

  const handleNextPlayer = () => {
    setIsRoleVisible(false);
    nextPlayer();
  };

  const handleNewRoundSameCategory = async () => {
    try {
      await startNewRoundSameCategory();
    } catch {
      Alert.alert("Error", "No se pudo iniciar la nueva ronda. Intenta de nuevo.");
    }
  };

  const handleNewRound = () => {
    startNewRound();
    router.back();
  };

  const handleResetGame = () => {
    resetGame();
    router.back();
  };

  // --- Game Complete Screen ---
  if (gameState.phase === "complete") {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-1 justify-center px-5 py-8"
        >
          {/* Icon */}
          <View className="items-center mb-6">
            <Ionicons
              name="checkmark-circle-outline"
              size={80}
              color="#38bdf8"
            />
          </View>

          {/* Title */}
          <Text className="text-accent text-3xl font-bold text-center mb-8">
            ¡Todos tienen su rol!
          </Text>

          {/* Game rules */}
          <View className="bg-surface border border-border rounded-2xl p-5 mb-6">
            <Text className="text-primary text-lg text-center mb-4">
              Ahora pueden empezar a jugar en la vida real.
            </Text>
            <View className="gap-2">
              <Text className="text-secondary text-[15px]">
                • Los civiles deben dar pistas relacionadas con la palabra
                secreta
              </Text>
              <Text className="text-secondary text-[15px]">
                • Los impostores deben intentar sonar convincentes sin conocer
                la palabra
              </Text>
              <Text className="text-secondary text-[15px]">
                • Al final de la ronda, voten quién creen que es el impostor
              </Text>
            </View>
          </View>

          {/* Summary */}
          <View className="bg-surface border border-border rounded-2xl p-4 mb-8">
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-secondary text-[15px]">
                Total de jugadores
              </Text>
              <Text className="text-primary font-bold">
                {gameState.numberOfPlayers}
              </Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-secondary text-[15px]">
                Número de impostores
              </Text>
              <Text className="text-accent font-bold">
                {gameState.numberOfImpostors}
              </Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-secondary text-[15px]">Categoría</Text>
              <Text className="text-primary font-bold">
                {getCategoryLabel(gameState.category)}
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View className="gap-3">
            {/* Misma categoría - primary */}
            <Pressable
              onPress={handleNewRoundSameCategory}
              className="bg-accent rounded-2xl py-4 flex-row items-center justify-center gap-2"
            >
              <Ionicons name="refresh-outline" size={20} color="#ffffff" />
              <Text className="text-white text-xl font-bold">
                Misma categoría
              </Text>
            </Pressable>

            {/* Nueva ronda - outline */}
            <Pressable
              onPress={handleNewRound}
              className="border border-border rounded-2xl py-3 flex-row items-center justify-center gap-2"
            >
              <Ionicons
                name="folder-open-outline"
                size={20}
                color="#e2e8f0"
              />
              <Text className="text-primary text-lg font-semibold">
                Nueva ronda
              </Text>
            </Pressable>

            {/* Volver al inicio - text only */}
            <Pressable
              onPress={handleResetGame}
              className="py-3 items-center"
            >
              <Text className="text-secondary text-[15px]">
                Volver al inicio
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Privacy Screen ---
  if (!isRoleVisible) {
    const progress =
      ((gameState.currentPlayerIndex + 1) / gameState.numberOfPlayers) * 100;

    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center px-5">
          {/* Icon */}
          <View className="items-center mb-6">
            <Ionicons name="eye-off-outline" size={72} color="#38bdf8" />
          </View>

          {/* Title */}
          <Text className="text-primary text-3xl font-bold text-center mb-6">
            Turno de{" "}
            <Text className="text-accent">{currentPlayer?.name}</Text>
          </Text>

          {/* Privacy warning */}
          <View className="bg-impostor/10 border border-impostor/30 rounded-2xl p-5 mb-6">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="warning-outline" size={20} color="#ef4444" />
              <Text className="text-impostor font-semibold">
                Privacidad importante
              </Text>
            </View>
            <Text className="text-secondary text-[15px]">
              No mires la pantalla si no es tu turno. Pasale el celular a{" "}
              <Text className="text-primary font-bold">
                {currentPlayer?.name}
              </Text>
              .
            </Text>
          </View>

          {/* Progress */}
          <View className="items-center mb-4">
            <Text className="text-secondary text-lg mb-3">
              Jugador {gameState.currentPlayerIndex + 1} de{" "}
              {gameState.numberOfPlayers}
            </Text>
            <View className="w-full bg-border rounded-full h-2">
              <View
                className="bg-accent h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>

          {/* Action button */}
          <Pressable
            onPress={() => setIsRoleVisible(true)}
            className="bg-accent rounded-2xl py-4 items-center mt-4"
          >
            <Text className="text-white text-xl font-bold">
              Listo, ver mi rol
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // --- Role Reveal Screen ---
  const isImpostor = currentPlayer?.isImpostor;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center px-5">
        <View
          className={`border-2 rounded-2xl p-6 ${
            isImpostor
              ? "bg-impostor/10 border-impostor/40"
              : "bg-civil/10 border-civil/40"
          }`}
        >
          {/* Icon */}
          <View className="items-center mb-4">
            <Ionicons
              name="eye-outline"
              size={72}
              color={isImpostor ? "#ef4444" : "#22c55e"}
            />
          </View>

          {/* Role title */}
          <Text
            className={`text-center text-4xl font-black mb-6 ${
              isImpostor ? "text-impostor" : "text-civil"
            }`}
          >
            {isImpostor ? "SOS IMPOSTOR" : "SOS CIVIL"}
          </Text>

          {/* Role content */}
          {isImpostor ? (
            <View
              className="bg-surface border border-impostor/30 rounded-xl p-6 mb-6"
            >
              <Text className="text-impostor text-xl font-bold text-center mb-2">
                No conocés la palabra secreta
              </Text>
              <Text className="text-secondary text-[15px] text-center">
                Intentá sonar convincente y descubrir la palabra sin delatarte.
                Escuchá atentamente las pistas de los demás.
              </Text>
            </View>
          ) : (
            <View
              className="bg-surface border border-civil/30 rounded-xl p-6 mb-6"
            >
              <Text className="text-secondary text-lg text-center mb-2">
                Palabra secreta:
              </Text>
              <Text className="text-civil text-4xl font-black text-center mb-3">
                {gameState.secretWord}
              </Text>
              <Text className="text-secondary text-[15px] text-center">
                Da pistas relacionadas con esta palabra, pero sin decirla
                directamente. Intentá identificar a los impostores.
              </Text>
            </View>
          )}

          {/* Next button */}
          <Pressable
            onPress={handleNextPlayer}
            className="bg-accent rounded-2xl py-4 items-center mb-3"
          >
            <Text className="text-white text-xl font-bold">
              {isLastPlayer
                ? "Finalizar asignación"
                : "Ocultar y pasar al siguiente"}
            </Text>
          </Pressable>

          {/* Privacy notice */}
          <Text className="text-secondary text-sm text-center">
            Asegurate de que nadie más esté mirando antes de continuar
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
