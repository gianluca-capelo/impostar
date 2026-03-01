import { renderHook } from "@testing-library/react-native";
import { useSubscription } from "../hooks/useSubscription";

describe("useSubscription", () => {
  it("should return isPremium as false", () => {
    const { result } = renderHook(() => useSubscription());
    expect(result.current.isPremium).toBe(false);
  });

  it("should return isLoading as false", () => {
    const { result } = renderHook(() => useSubscription());
    expect(result.current.isLoading).toBe(false);
  });

  it("should return the complete subscription state shape", () => {
    const { result } = renderHook(() => useSubscription());
    expect(result.current).toEqual({
      isPremium: false,
      isLoading: false,
    });
  });
});
