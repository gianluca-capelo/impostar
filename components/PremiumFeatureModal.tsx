import { View, Text, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PremiumFeatureModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PremiumFeatureModal({
  visible,
  onClose,
}: PremiumFeatureModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Pressable
        className="flex-1 bg-black/60 justify-center items-center px-6"
        onPress={onClose}
      >
        {/* Content card */}
        <Pressable
          className="bg-surface border border-border rounded-2xl w-full max-w-sm overflow-hidden"
          onPress={() => {}}
        >
          {/* Icon header */}
          <View className="items-center pt-8 pb-4">
            <View className="w-16 h-16 rounded-full bg-yellow-600/30 items-center justify-center mb-4">
              <Ionicons name="sparkles" size={32} color="#facc15" />
            </View>
            <Text className="text-xl font-bold text-primary">
              Función Premium
            </Text>
          </View>

          {/* Description */}
          <View className="px-6 pb-6">
            <Text className="text-base text-secondary text-center leading-6">
              La generación de palabras con IA es una función exclusiva para
              suscriptores premium.
            </Text>
            <Text className="text-base text-secondary text-center leading-6 mt-3">
              Estará disponible en una futura actualización.
            </Text>
          </View>

          {/* Close button */}
          <View className="px-6 pb-6">
            <Pressable
              onPress={onClose}
              className="bg-accent rounded-xl py-3.5 items-center"
            >
              <Text className="text-white text-base font-bold">Entendido</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
