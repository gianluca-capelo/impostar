import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10"
      >
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1 py-3 -ml-1"
        >
          <Ionicons name="arrow-back-outline" size={20} color="#38bdf8" />
          <Text className="text-accent text-base">Volver</Text>
        </Pressable>

        {/* Title */}
        <Text className="text-3xl font-bold text-primary mb-8">
          Configuración
        </Text>

        {/* Navigation cards */}
        <View className="gap-4">
          {/* FAQ */}
          <Pressable
            onPress={() => router.push("/faq")}
            className="flex-row items-center justify-between p-4 bg-surface border border-border rounded-2xl"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="help-circle-outline" size={22} color="#38bdf8" />
              <Text className="text-primary font-medium text-base">
                Ayuda / FAQ
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </Pressable>

          {/* Privacy */}
          <Pressable
            onPress={() => router.push("/privacy")}
            className="flex-row items-center justify-between p-4 bg-surface border border-border rounded-2xl"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#38bdf8"
              />
              <Text className="text-primary font-medium text-base">
                Política de privacidad
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
