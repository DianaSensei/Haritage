import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Animated, Platform, StyleSheet, TouchableOpacity } from 'react-native';

import { useAppTheme } from '@/shared/hooks';

interface GlassyFABProps {
  isVisible: boolean;
  isTabBarVisible: boolean;
  opacity?: Animated.Value;
  onPress?: () => void;
}

/**
 * Native Platform FAB Component
 * - Shows when tab bar is collapsed (onScrollDown)
 * - Hides when tab bar is fully visible (onScrollUp)
 * - Uses native iOS 18+ liquid glass styling when available
 * - Fallback to solid button on older iOS/Android
 * - Smooth opacity and position transitions
 * - Syncs with native NativeTabs minimizeBehavior="onScrollDown"
 */
export const GlassyFAB: React.FC<GlassyFABProps> = ({
  isVisible,
  isTabBarVisible,
  opacity,
  onPress,
}) => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePress = () => {
    onPress?.() || router.push('/create-post');
  };

  // FAB should show when tab bar is collapsed (isVisible = true from scroll down)
  // FAB should hide when tab bar is expanded (isVisible = false from scroll up)
  if (!isVisible) {
    return null;
  }

  const animatedStyle = opacity ? { opacity } : {};

  // Check if iOS 18+ for liquid glass effect
  const isIOS18Plus = Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 18;

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          pointerEvents: isVisible ? 'auto' : 'none',
        },
      ]}
    >
      {isIOS18Plus ? (
        // iOS 18+ Liquid Glass Style
        <BlurView intensity={80} tint="prominent" style={styles.liquidGlassContainer}>
          <TouchableOpacity
            style={styles.liquidGlassFab}
            onPress={handlePress}
            activeOpacity={0.7}
            accessibilityLabel="Create post"
            accessibilityRole="button"
          >
            <MaterialIcons name="add" size={28} color="#ffffff" />
          </TouchableOpacity>
        </BlurView>
      ) : (
        // Fallback for older iOS/Android
        <TouchableOpacity
          style={styles.fab}
          onPress={handlePress}
          activeOpacity={0.7}
          accessibilityLabel="Create post"
          accessibilityRole="button"
        >
          <MaterialIcons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      right: 16,
      bottom: 20,
      zIndex: 999,
    },
    // iOS 18+ Liquid Glass Styling
    liquidGlassContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      overflow: 'hidden',
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    liquidGlassFab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accentSoft,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Fallback Solid Button
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  });

export default GlassyFAB;
