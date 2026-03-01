import { View, Text } from "react-native";

export function GameTitle() {
  return (
    <View className="items-center py-6">
      <Text className="text-6xl font-black tracking-tight">
        <Text className="text-white">IMPOST</Text>
        <Text style={{ color: "#7dd3fc" }}>AR</Text>
      </Text>
      <Text className="text-lg text-secondary mt-2">¿Sos o te hacés?</Text>
    </View>
  );
}
