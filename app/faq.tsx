import { useState } from "react";
import { View, Text, Pressable, ScrollView, Linking } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const CONTACT_CONFIG = {
  email: "broqui.apps@gmail.com",
  subject: "Consulta desde Impostar",
  body: "Hola,\n\nTengo una consulta sobre la aplicación:\n\n",
};

const getMailtoUrl = () => {
  const { email, subject, body } = CONTACT_CONFIG;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const FAQ_ITEMS = [
  {
    id: "compra-no-aparece",
    question: "¿Por qué mi compra no aparece en mi biblioteca?",
    answer:
      "Es posible que el procesamiento de tu compra esté tardando un poco más de lo habitual. Si esto no funciona, prueba desinstalar y volver a instalar el juego.",
  },
  {
    id: "cargo-tarjeta",
    question: "¿Cuándo se realizará el cargo en mi tarjeta?",
    answer:
      "Se cargará el importe a tu tarjeta en el momento en que te suscribas a un plan o realices una compra. Todos los cargos posteriores se realizarán el día de la renovación, que puede ser semanal o anual.",
  },
  {
    id: "cancelar-suscripcion",
    question: "¿Cómo puedo cancelar mi suscripción?",
    answer: "Puedes gestionar tus suscripciones en Google Play.",
  },
];

export default function FaqScreen() {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
          <Text className="text-accent text-base">
            Volver a configuración
          </Text>
        </Pressable>

        {/* Title */}
        <View className="flex-row items-center gap-3 mb-8">
          <Ionicons name="help-circle-outline" size={28} color="#38bdf8" />
          <Text className="text-3xl font-bold text-primary">Ayuda / FAQ</Text>
        </View>

        {/* Accordion */}
        <View className="gap-3">
          {FAQ_ITEMS.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            return (
              <View
                key={item.id}
                className="bg-surface border border-border rounded-2xl overflow-hidden"
              >
                <Pressable
                  onPress={() => toggleItem(item.id)}
                  className="flex-row items-center justify-between p-4"
                >
                  <Text className="text-primary font-medium text-base flex-1 pr-3">
                    {item.question}
                  </Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#94a3b8"
                  />
                </Pressable>
                {isExpanded && (
                  <View className="px-4 pb-4">
                    <View className="h-px bg-border mb-3" />
                    <Text className="text-secondary text-[15px] leading-relaxed">
                      {item.answer}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Contact section */}
        <View className="mt-12 pt-8 border-t border-border items-center">
          <Text className="text-secondary mb-4">
            ¿No has encontrado lo que buscabas?
          </Text>
          <Pressable
            onPress={() => Linking.openURL(getMailtoUrl())}
            className="flex-row items-center justify-center gap-2 border border-accent rounded-2xl py-3 px-6"
          >
            <Ionicons name="chatbubble-outline" size={18} color="#38bdf8" />
            <Text className="text-accent font-semibold text-base">
              Ponte en contacto
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
