import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Typography } from '@/core/config/theme';
import { useAppTheme } from '@/shared/hooks';
import { MaterialIcons } from '@expo/vector-icons';
import {
    Icon,
    Label,
    NativeTabs,
    VectorIcon,
} from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const containerStyle = useMemo(
    () => ({ flex: 1, backgroundColor: colors.background }),
    [colors.background],
  );

  const labelStyle = useMemo(
    () => ({
      default: {
        color: colors.tabIconDefault,
        fontSize: Typography.size.xs,
        fontWeight: Typography.weight.semibold,
      },
      selected: {
        color: colors.tabIconSelected,
        fontSize: Typography.size.xs,
        fontWeight: Typography.weight.bold,
      },
    }),
    [colors.tabIconDefault, colors.tabIconSelected],
  );

  const iconColor = useMemo(
    () => ({
      default: colors.tabIconDefault,
      selected: colors.tabIconSelected,
    }),
    [colors.tabIconDefault, colors.tabIconSelected],
  );

  return (
    <View style={containerStyle}>
      <NativeTabs
        labelStyle={labelStyle}
        tintColor={colors.tabIconSelected}
        backgroundColor={colors.card}
        indicatorColor={colors.accent}
        iconColor={iconColor}
        blurEffect="none"
        shadowColor={colors.shadow}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger name="index">
          <Label>{t('tabs.home')}</Label>
          <Icon src={<VectorIcon family={MaterialIcons} name="home" />} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="map">
          <Label>{t('tabs.map')}</Label>
          <Icon src={<VectorIcon family={MaterialIcons} name="map" />} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="commercial">
          <Label>{t('tabs.commercial')}</Label>
          <Icon src={<VectorIcon family={MaterialIcons} name="storefront" />} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="account">
          <Label>{t('tabs.account')}</Label>
          <Icon src={<VectorIcon family={MaterialIcons} name="person" />} />
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}
