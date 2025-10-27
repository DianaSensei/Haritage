import React from 'react';
import { StyleSheet, View } from 'react-native';

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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surfaceSecondary,
        borderTopColor: colors.border,
        borderTopWidth: StyleSheet.hairlineWidth,
      }}
    >
      <NativeTabs
        labelStyle={{
          default: {
            color: colors.tabIconDefault,
            fontSize: 12,
            fontWeight: '600' as const,
          },
          selected: {
            color: colors.tabIconSelected,
            fontSize: 12,
            fontWeight: '600' as const,
          },
        }}
        tintColor={colors.tabIconSelected}
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
