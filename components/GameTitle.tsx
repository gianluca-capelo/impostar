import { View, Text, Platform } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

const arStyle = { fontSize: 60, fontWeight: "900" as const, color: "#7dd3fc" };

function GradientAR() {
  if (Platform.OS === "android") {
    return <Text style={arStyle}>AR</Text>;
  }

  return (
    <MaskedView maskElement={<Text style={arStyle}>AR</Text>}>
      <LinearGradient
        colors={["#7dd3fc", "#ffffff", "#7dd3fc"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Text style={[arStyle, { opacity: 0 }]}>AR</Text>
      </LinearGradient>
    </MaskedView>
  );
}

export function GameTitle() {
  return (
    <View className="items-center py-6">
      <View className="flex-row items-baseline">
        <Text className="text-6xl font-black tracking-tight text-white">
          IMPOST
        </Text>
        <GradientAR />
      </View>
      <Text className="text-lg text-secondary mt-2">¿Sos o te hacés?</Text>
    </View>
  );
}
