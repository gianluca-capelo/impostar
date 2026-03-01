# Fase 7: Settings + FAQ + Privacy

## Archivos creados
- `app/settings.tsx` — Pantalla de configuración con 2 cards navegables
- `app/faq.tsx` — FAQ con acordeón (Pressable + useState<Set>)
- `app/privacy.tsx` — Política de privacidad (8 secciones, ScrollView)
- `__tests__/SettingsScreen.test.tsx` — 5 tests
- `__tests__/FaqScreen.test.tsx` — 9 tests
- `__tests__/PrivacyScreen.test.tsx` — 5 tests

## Archivos modificados
- `app/index.tsx` — Botón settings: `Alert.alert("Próximamente")` → `router.push("/settings")`

## Qué se copió
- **Texto verbatim**: FAQ_ITEMS (3 preguntas y respuestas), CONTACT_CONFIG (email, subject, body), getMailtoUrl(), las 8 secciones completas de la política de privacidad
- **Estructura de navegación**: Settings como hub con links a FAQ y Privacy

## Qué se adaptó
- **Navegación**: React Router `<Link to="...">` → expo-router `router.push()` / `router.back()`
- **Íconos**: lucide-react → Ionicons (@expo/vector-icons)
  - ArrowLeft → arrow-back-outline
  - HelpCircle → help-circle-outline
  - Shield → shield-checkmark-outline
  - ChevronRight → chevron-forward
  - MessageCircle → chatbubble-outline
  - chevron-up / chevron-down (acordeón)
- **Acordeón**: shadcn/ui Accordion (type="multiple") → Pressable + useState<Set<string>> con render condicional
- **Email**: `<a href={mailto}>` → `Linking.openURL(mailto)` de react-native
- **Estilos**: Tailwind web → NativeWind
  - min-h-screen → flex-1 en SafeAreaView
  - bg-[#0d1117] → bg-background (#161622)
  - text-[#22a6a6] (teal) → text-accent (#38bdf8 sky-blue)
  - bg-white/5 → bg-surface
  - border-white/10 → border-border
  - space-y-N → gap-N
  - list-disc list-inside → "\u2022  " unicode bullet
  - `<strong>` → `<Text className="text-primary font-bold">`
- **Botones**: shadcn/ui Button → Pressable con NativeWind classes

## Qué se descartó
- shadcn/ui completo (Button, Accordion, AccordionItem, AccordionTrigger, AccordionContent)
- Hover effects (hover:bg-white/10, hover:text-[#22a6a6])
- max-w-3xl mx-auto (no aplica en mobile)
- HTML semántico (section, h2, ul, li, strong, a)
