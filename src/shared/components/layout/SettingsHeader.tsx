import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';

type SettingsHeaderProps = {
  title: string;
  onBack?: () => void;
  backAccessibilityLabel?: string;
  rightAccessory?: React.ReactNode;
};

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  title,
  onBack,
  backAccessibilityLabel,
  rightAccessory,
}) => {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={backAccessibilityLabel}
        >
          <Ionicons name="chevron-back" size={20} color={colors.icon} />
        </TouchableOpacity>
      ) : (
        <View style={styles.sideSpacer} />
      )}

      <ThemedText style={styles.title}>{title}</ThemedText>

      {rightAccessory ? (
        <View style={styles.sideSlot}>{rightAccessory}</View>
      ) : (
        <View style={styles.sideSpacer} />
      )}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      backgroundColor: colors.surface,
    },
    backButton: {
      width: 36,
      height: 36,
      padding: 8,
      borderRadius: 12,
      backgroundColor: colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    sideSpacer: {
      width: 36,
      height: 36,
    },
    sideSlot: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
