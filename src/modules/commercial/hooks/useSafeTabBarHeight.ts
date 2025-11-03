import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FALLBACK_TAB_BAR_HEIGHT = 56;

/**
 * Returns a stable tab bar height suitable for screens rendered outside of
 * React Navigation's bottom tab context (e.g., Expo Native Tabs).
 */
export const useSafeTabBarHeight = () => {
  const insets = useSafeAreaInsets();

  return useMemo(() => FALLBACK_TAB_BAR_HEIGHT + Math.max(insets.bottom - 8, 0), [insets.bottom]);
};
