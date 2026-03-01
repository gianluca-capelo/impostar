import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RolesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-primary text-2xl font-bold">
          Pantalla de roles
        </Text>
        <Text className="text-secondary mt-2 text-center">
          Fase 6 — Pendiente
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-8 bg-accent rounded-xl px-6 py-3"
        >
          <Text className="text-white font-semibold">Volver</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
