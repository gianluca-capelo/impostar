import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#e2e8f0", fontSize: 24, fontWeight: "bold" }}>Impostar</Text>
      <Text style={{ color: "#94a3b8", marginTop: 8 }}>Scaffolding OK</Text>
    </View>
  );
}
