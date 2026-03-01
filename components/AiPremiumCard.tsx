import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AiPremiumCardProps {
  onPress?: () => void;
  isActive?: boolean;
  isLocked?: boolean;
}

export function AiPremiumCard({
  onPress,
  isActive = false,
  isLocked = true,
}: AiPremiumCardProps) {
  const containerClass = isActive
    ? "bg-surface border-2 border-accent rounded-2xl p-4"
    : isLocked
      ? "bg-surface border border-border rounded-2xl p-4 opacity-70"
      : "bg-surface border border-border rounded-2xl p-4";

  return (
    <Pressable onPress={onPress} className={containerClass}>
      <View className="flex-row items-center gap-4">
        <View className="relative">
          <Ionicons name="sparkles" size={36} color="#38bdf8" />
          {isLocked && (
            <View className="absolute -top-1 -right-1">
              <Ionicons name="lock-closed" size={14} color="#facc15" />
            </View>
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-xl font-bold text-sky-400">
              Generar con IA
            </Text>
            {isActive ? (
              <View className="bg-green-600/30 rounded-full px-2 py-0.5">
                <Text className="text-xs font-bold text-green-400">ACTIVO</Text>
              </View>
            ) : (
              <View className="bg-yellow-600/30 rounded-full px-2 py-0.5">
                <Text className="text-xs font-bold text-yellow-400">
                  PREMIUM
                </Text>
              </View>
            )}
          </View>
          <Text className="text-[15px] text-secondary mt-1">
            Creá categorías únicas con inteligencia artificial
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
