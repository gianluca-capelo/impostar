import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function PrivacyScreen() {
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
        <Text className="text-3xl font-bold text-primary mb-2">
          Política de Privacidad
        </Text>
        <Text className="text-secondary mb-8">
          Última actualización: Diciembre 2025
        </Text>

        {/* Sections */}
        <View className="gap-8">
          {/* 1. Introducción */}
          <View>
            <Text className="text-xl font-semibold text-accent mb-3">
              Introducción
            </Text>
            <Text className="text-secondary text-[15px] leading-relaxed">
              <Text className="text-primary font-bold">
                Impostar - El Impostor Argentino
              </Text>
              {" "}es un juego de fiesta diseñado para ser jugado entre amigos.
              Nos tomamos muy en serio tu privacidad. Esta política describe qué
              información maneja la aplicación y cómo se utiliza.
            </Text>
          </View>

          {/* 2. Datos que NO recopilamos */}
          <View>
            <Text className="text-xl font-semibold text-accent mb-3">
              Datos que NO recopilamos
            </Text>
            <Text className="text-secondary text-[15px] leading-relaxed mb-3">
              Impostar{" "}
              <Text className="text-primary font-bold">
                no recopila, almacena ni transmite
              </Text>
              {" "}ningún dato personal identificable. Específicamente:
            </Text>
            <View className="gap-2 ml-2">
              <Text className="text-secondary text-[15px] leading-relaxed">
                {"\u2022  "}No requerimos registro ni creación de cuenta
              </Text>
              <Text className="text-secondary text-[15px] leading-relaxed">
                {"\u2022  "}No recopilamos nombres, emails, ni información de
                contacto
              </Text>
              <Text className="text-secondary text-[15px] leading-relaxed">
                {"\u2022  "}No accedemos a tu ubicación, contactos, cámara ni
                micrófono
              </Text>
              <Text className="text-secondary text-[15px] leading-relaxed">
                {"\u2022  "}No usamos cookies de seguimiento ni publicidad
              </Text>
            </View>
          </View>

          {/* 3. Almacenamiento local */}
          <View>
            <Text className="text-xl font-semibold text-accent mb-3">
              Almacenamiento local
            </Text>
            <Text className="text-secondary text-[15px] leading-relaxed">
              La aplicación utiliza el almacenamiento del dispositivo para
              guardar:
            </Text>
            <View className="gap-2 ml-2 mt-3">
              <Text className="text-secondary text-[15px] leading-relaxed">
                {"\u2022  "}Historial de palabras ya utilizadas en partidas
                anteriores
              </Text>
              <Text className="text-secondary text-[15px] leading-relaxed">
                {"\u2022  "}Preferencias de configuración del juego
              </Text>
            </View>
            <Text className="text-secondary text-[15px] leading-relaxed mt-3">
              Estos datos{" "}
              <Text className="text-primary font-bold">
                permanecen únicamente en tu dispositivo
              </Text>
              {" "}y nunca se envían a ningún servidor. Podés borrar estos datos
              en cualquier momento desde la configuración del juego o limpiando
              los datos de la aplicación.
            </Text>
          </View>

          {/* 4. Generación de palabras con IA */}
          <View>
            <Text className="text-xl font-semibold text-accent mb-3">
              Generación de palabras con IA
            </Text>
            <Text className="text-secondary text-[15px] leading-relaxed">
              La función de "Categoría personalizada" utiliza un servicio de
              inteligencia artificial (Groq) para generar palabras basadas en la
              descripción que escribís. Cuando usás esta función:
            </Text>
            <View className="gap-2 ml-2 mt-3">
              <Text className="text-secondary text-[15px] leading-relaxed">
                {"\u2022  "}Solo se envía la descripción de la categoría que
                escribís
              </Text>
              <Text className="text-secondary text-[15px] leading-relaxed">
                {"\u2022  "}No se envía ninguna información personal ni
                identificadores
              </Text>
              <Text className="text-secondary text-[15px] leading-relaxed">
                {"\u2022  "}Las solicitudes son anónimas
              </Text>
            </View>
          </View>

          {/* 5. Nombres de jugadores */}
          <View>
            <Text className="text-xl font-semibold text-accent mb-3">
              Nombres de jugadores
            </Text>
            <Text className="text-secondary text-[15px] leading-relaxed">
              Los nombres que ingresás para los jugadores durante una partida se
              almacenan temporalmente en la memoria de la aplicación mientras
              dura la sesión de juego.{" "}
              <Text className="text-primary font-bold">
                Nunca se guardan permanentemente ni se envían a ningún servidor
              </Text>
              . Al cerrar la aplicación o iniciar un juego nuevo, estos nombres
              se eliminan.
            </Text>
          </View>

          {/* 6. Servicios de terceros */}
          <View>
            <Text className="text-xl font-semibold text-accent mb-3">
              Servicios de terceros
            </Text>
            <Text className="text-secondary text-[15px] leading-relaxed mb-3">
              La aplicación utiliza los siguientes servicios de terceros:
            </Text>
            <View className="gap-2 ml-2">
              <Text className="text-secondary text-[15px] leading-relaxed">
                {"\u2022  "}
                <Text className="text-primary font-bold">Groq:</Text> Para la
                generación de palabras mediante IA
              </Text>
            </View>
          </View>

          {/* 7. Cambios en esta política */}
          <View>
            <Text className="text-xl font-semibold text-accent mb-3">
              Cambios en esta política
            </Text>
            <Text className="text-secondary text-[15px] leading-relaxed">
              Podemos actualizar esta política de privacidad ocasionalmente. Te
              notificaremos de cualquier cambio publicando la nueva política en
              esta página con una fecha de actualización revisada.
            </Text>
          </View>

          {/* Footer */}
          <View className="border-t border-border pt-8">
            <Text className="text-secondary text-sm">
              Esta política es efectiva a partir de diciembre de 2025.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
