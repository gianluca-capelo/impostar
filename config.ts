// M-2: API base URL configurable via EXPO_PUBLIC_API_URL env var.
// Set EXPO_PUBLIC_API_URL in .env to point to staging or local environments without recompiling.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://impostar.app";
