import { View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function AiPremiumCard() {
  const handlePress = () => {
    Alert.alert(
      "Función Premium",
      "La generación de palabras con IA estará disponible en una futura actualización."
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      className="bg-surface border border-border rounded-2xl p-4 opacity-70"
    >
      <View className="flex-row items-center gap-4">
        <View className="relative">
          <Ionicons name="sparkles" size={36} color="#38bdf8" />
          <View className="absolute -top-1 -right-1">
            <Ionicons name="lock-closed" size={14} color="#facc15" />
          </View>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-xl font-bold text-sky-400">
              Generar con IA
            </Text>
            <View className="bg-yellow-600/30 rounded-full px-2 py-0.5">
              <Text className="text-xs font-bold text-yellow-400">PREMIUM</Text>
            </View>
          </View>
          <Text className="text-[15px] text-secondary mt-1">
            Creá categorías únicas con inteligencia artificial
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
