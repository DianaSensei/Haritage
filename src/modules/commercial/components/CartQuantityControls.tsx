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
          size={variant === 'compact' ? 16 : 18}
          color={colors.background}
        />
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
        accessibilityLabel={t(quantity <= 1 ? 'commercial.cart.remove' : 'commercial.cart.decrease')}
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
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    addButton: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accentStrong,
    },
    addButtonCompact: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 999,
      paddingVertical: 5,
      paddingHorizontal: 7,
      gap: 6,
    },
    quantityContainerCompact: {
      paddingVertical: 3,
      paddingHorizontal: 5,
      gap: 4,
    },
    controlButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    controlButtonCompact: {
      width: 26,
      height: 26,
      borderRadius: 13,
    },
    quantityLabel: {
      minWidth: 22,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
  });
