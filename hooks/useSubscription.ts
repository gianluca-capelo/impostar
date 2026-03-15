export interface SubscriptionState {
  /** Whether the user has an active premium subscription */
  isPremium: boolean;
  /** Whether subscription status is being loaded/verified */
  isLoading: boolean;
}

// Flip a true para probar features premium durante desarrollo
const DEV_PREMIUM = true; // TODO: cambiar a false cuando se implemente react-native-iap

/**
 * Stub hook for premium subscription status.
 *
 * TODO: Implement with react-native-iap for iOS subscriptions.
 */
export function useSubscription(): SubscriptionState {
  return {
    isPremium: DEV_PREMIUM,
    isLoading: false,
  };
}
