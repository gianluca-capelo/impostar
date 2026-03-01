import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WordCategory } from "../types/game";
import { CATEGORY_OPTIONS, CategoryOption } from "../utils/categories";

interface CategoryPickerProps {
  selectedCategory: WordCategory;
  onSelectCategory: (category: WordCategory) => void;
}

export function CategoryPicker({
  selectedCategory,
  onSelectCategory,
}: CategoryPickerProps) {
  const [visible, setVisible] = useState(false);

  const selectedOption = CATEGORY_OPTIONS.find(
    (c) => c.value === selectedCategory
  );

  const handleSelect = (category: WordCategory) => {
    onSelectCategory(category);
    setVisible(false);
  };

  const renderItem = ({ item }: { item: CategoryOption }) => {
    const isSelected = item.value === selectedCategory;
    return (
      <Pressable
        onPress={() => handleSelect(item.value)}
        className={`flex-row items-center px-5 py-4 ${
          isSelected ? "bg-accent/15" : ""
        }`}
      >
        <Text className="text-xl mr-3">{item.emoji}</Text>
        <Text
          className={`flex-1 text-base ${
            isSelected ? "text-accent font-semibold" : "text-primary"
          }`}
        >
          {item.label}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color="#38bdf8" />
        )}
      </Pressable>
    );
  };

  return (
    <View>
      <Text className="text-base text-primary font-medium mb-2 flex-row items-center">
        <Ionicons name="text-outline" size={16} color="#e2e8f0" />{" "}
        Categoría de palabra secreta
      </Text>

      <Pressable
        onPress={() => setVisible(true)}
        className="bg-surface border border-border rounded-xl px-4 py-3.5 flex-row items-center justify-between"
      >
        <Text className="text-base text-primary">
          {selectedOption
            ? `${selectedOption.emoji}  ${selectedOption.label}`
            : "Seleccioná una categoría"}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#94a3b8" />
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/60"
          onPress={() => setVisible(false)}
        />
        <View className="bg-surface rounded-t-3xl pb-8 max-h-[70%]">
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-border" />
          </View>
          <Text className="text-lg font-bold text-primary text-center pb-3">
            Seleccionar categoría
          </Text>
          <FlatList
            data={CATEGORY_OPTIONS}
            renderItem={renderItem}
            keyExtractor={(item) => item.value}
            ItemSeparatorComponent={() => (
              <View className="h-px bg-border/50 mx-5" />
            )}
          />
          <Pressable
            onPress={() => setVisible(false)}
            className="mx-5 mt-4 py-3 rounded-xl items-center bg-border/30"
          >
            <Text className="text-secondary text-base font-medium">
              Cancelar
            </Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
