import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GameProvider } from "../context/GameContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0a0a0a" },
            animation: "slide_from_right",
          }}
        />
      </GameProvider>
    </SafeAreaProvider>
  );
}
