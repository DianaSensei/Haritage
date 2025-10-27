import React, { useMemo } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/shared/hooks';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  const { colors } = useAppTheme();

  const containerStyle = useMemo(
    () => ({ flex: 1, backgroundColor: colors.background }),
    [colors.background],
  );

  const labelStyle = useMemo(
    () => ({
      default: {
        color: colors.tabIconDefault,
        fontSize: 12,
        fontWeight: '600' as const,
      },
      selected: {
        color: colors.tabIconSelected,
        fontSize: 12,
        fontWeight: '700' as const,
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
        backgroundColor={colors.surfaceSecondary}
        indicatorColor={colors.accent}
        iconColor={iconColor}
      >
        <NativeTabs.Trigger name="index">
          <Label>Home</Label>
          <Icon src={<VectorIcon family={MaterialIcons} name="home" />} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="explore">
          <Label>Explore</Label>
          <Icon src={<VectorIcon family={MaterialIcons} name="send" />} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="map">
          <Label>Map</Label>
          <Icon src={<VectorIcon family={MaterialIcons} name="map" />} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="account">
          <Label>Account</Label>
          <Icon src={<VectorIcon family={MaterialIcons} name="person" />} />
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}
