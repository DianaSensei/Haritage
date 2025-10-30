import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

import { useCartStore } from '@/core/store';
import { CartItemInput } from '@/modules/commercial/types';
import { ThemedText } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';

type CartQuantityControlsVariant = 'default' | 'compact';

interface CartQuantityControlsProps extends CartItemInput {
  variant?: CartQuantityControlsVariant;
  style?: StyleProp<ViewStyle>;
}

export const CartQuantityControls: React.FC<CartQuantityControlsProps> = ({
  id,
  name,
  priceCents,
  priceLabel,
  imageUrl,
  storeId,
  storeName,
  accentColor,
  variant = 'default',
  style,
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const quantity = useCartStore((state) => state.items[id]?.quantity ?? 0);
  const addItem = useCartStore((state) => state.addItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const handleAdd = useCallback(() => {
    addItem({
      id,
      name,
      priceCents,
      priceLabel,
      imageUrl,
      storeId,
      storeName,
      accentColor,
    });
  }, [accentColor, addItem, id, imageUrl, name, priceCents, priceLabel, storeId, storeName]);

  const handleIncrease = useCallback(() => {
    incrementItem(id);
  }, [id, incrementItem]);

  const handleDecrease = useCallback(() => {
    if (quantity <= 1) {
      removeItem(id);
      return;
    }

    decrementItem(id);
  }, [decrementItem, id, quantity, removeItem]);

  const handleRemove = useCallback(() => {
    removeItem(id);
  }, [id, removeItem]);

  if (quantity === 0) {
    return (
      <TouchableOpacity
        style={[
          styles.addButton,
          variant === 'compact' ? styles.addButtonCompact : null,
          style,
        ]}
        activeOpacity={0.85}
        onPress={handleAdd}
        accessibilityRole="button"
        accessibilityLabel={t('commercial.cart.add')}
      >
        <Ionicons
          name="cart-outline"
          size={variant === 'compact' ? 14 : 16}
          color={colors.background}
        />
        <ThemedText style={styles.addButtonLabel}>
          {t('commercial.cart.add')}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.quantityContainer,
        variant === 'compact' ? styles.quantityContainerCompact : null,
        style,
      ]}
    >
      <TouchableOpacity
        style={[styles.controlButton, variant === 'compact' ? styles.controlButtonCompact : null]}
        onPress={handleDecrease}
        activeOpacity={0.85}
        accessibilityLabel={t('commercial.cart.decrease')}
      >
        <Ionicons
          name={quantity <= 1 ? 'trash-outline' : 'remove'}
          size={variant === 'compact' ? 14 : 16}
          color={colors.text}
        />
      </TouchableOpacity>
      <ThemedText style={styles.quantityLabel}>{quantity}</ThemedText>
      <TouchableOpacity
        style={[styles.controlButton, variant === 'compact' ? styles.controlButtonCompact : null]}
        onPress={handleIncrease}
        activeOpacity={0.85}
        accessibilityLabel={t('commercial.cart.increase')}
      >
        <Ionicons
          name="add"
          size={variant === 'compact' ? 14 : 16}
          color={colors.text}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.removeButton, variant === 'compact' ? styles.removeButtonCompact : null]}
        onPress={handleRemove}
        activeOpacity={0.85}
        accessibilityLabel={t('commercial.cart.remove')}
      >
        <Ionicons
          name="close"
          size={variant === 'compact' ? 14 : 16}
          color={colors.iconMuted}
        />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: colors.accentStrong,
    },
    addButtonCompact: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    addButtonLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.background,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 8,
      gap: 6,
    },
    quantityContainerCompact: {
      paddingVertical: 4,
      paddingHorizontal: 6,
      gap: 4,
    },
    controlButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    controlButtonCompact: {
      width: 28,
      height: 28,
      borderRadius: 14,
    },
    removeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    removeButtonCompact: {
      width: 28,
      height: 28,
      borderRadius: 14,
    },
    quantityLabel: {
      minWidth: 24,
      textAlign: 'center',
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
  });
