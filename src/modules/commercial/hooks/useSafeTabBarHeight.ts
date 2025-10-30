import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Safely retrieves the tab bar height when rendered inside a bottom tab navigator.
 * Falls back to the device bottom safe-area inset when no tab bar is present.
 */
export const useSafeTabBarHeight = () => {
  const insets = useSafeAreaInsets();
  const hasWarnedRef = useRef(false);

  try {
    const height = useBottomTabBarHeight();
    return height > 0 ? height : insets.bottom;
  } catch (error) {
    if (__DEV__ && !hasWarnedRef.current) {
      hasWarnedRef.current = true;
      console.warn('[useSafeTabBarHeight] Falling back to safe-area inset for tab bar height.', error);
    }

    return insets.bottom;
  }
};
