import { View, Text, TextInput, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PlayerConfigProps {
  numberOfPlayers: string;
  numberOfImpostors: string;
  useCustomNames: boolean;
  playerNames: string[];
  onPlayersChange: (value: string) => void;
  onImpostorsChange: (value: string) => void;
  onCustomNamesToggle: (value: boolean) => void;
  onPlayerNameChange: (index: number, name: string) => void;
}

export function PlayerConfig({
  numberOfPlayers,
  numberOfImpostors,
  useCustomNames,
  playerNames,
  onPlayersChange,
  onImpostorsChange,
  onCustomNamesToggle,
  onPlayerNameChange,
}: PlayerConfigProps) {
  const maxImpostors = Math.max(1, (parseInt(numberOfPlayers) || 0) - 1);
  const playerCount = parseInt(numberOfPlayers) || 0;

  return (
    <View className="gap-4">
      {/* Players and Impostors side by side */}
      <View className="flex-row gap-4">
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2">
            <Ionicons name="people-outline" size={16} color="#e2e8f0" />
            <Text className="text-base text-primary font-medium">
              Jugadores
            </Text>
          </View>
          <TextInput
            value={numberOfPlayers}
            onChangeText={onPlayersChange}
            keyboardType="number-pad"
            className="bg-surface border border-border rounded-xl px-4 py-3 text-primary text-lg text-center"
            placeholderTextColor="#94a3b8"
          />
          <Text className="text-xs text-secondary">3-12</Text>
        </View>

        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2">
            <Ionicons name="grid-outline" size={16} color="#38bdf8" />
            <Text className="text-base text-primary font-medium">
              Impostores
            </Text>
          </View>
          <TextInput
            value={numberOfImpostors}
            onChangeText={onImpostorsChange}
            keyboardType="number-pad"
            className="bg-surface border border-border rounded-xl px-4 py-3 text-primary text-lg text-center"
            placeholderTextColor="#94a3b8"
          />
          <Text className="text-xs text-secondary">Máx. {maxImpostors}</Text>
        </View>
      </View>

      {/* Custom names toggle */}
      <View className="flex-row items-center justify-between py-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="person-outline" size={16} color="#e2e8f0" />
          <Text className="text-base text-primary font-medium">
            Nombres personalizados
          </Text>
        </View>
        <Switch
          value={useCustomNames}
          onValueChange={onCustomNamesToggle}
          trackColor={{ false: "#2d2d44", true: "#38bdf8" }}
          thumbColor="#e2e8f0"
        />
      </View>

      {/* Dynamic name inputs */}
      {useCustomNames && (
        <View className="gap-2">
          <Text className="text-[15px] text-secondary">
            Ingresá el nombre de cada jugador (opcional)
          </Text>
          {Array.from({ length: playerCount }).map((_, i) => (
            <TextInput
              key={`player-${i}`}
              value={playerNames[i] || ""}
              onChangeText={(text) => onPlayerNameChange(i, text)}
              placeholder={`Jugador ${i + 1}`}
              placeholderTextColor="#94a3b8"
              className="bg-surface border border-border rounded-xl px-4 py-2.5 text-primary text-base"
            />
          ))}
        </View>
      )}
    </View>
  );
}
