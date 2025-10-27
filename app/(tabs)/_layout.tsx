import React from "react";

import { useAppTheme } from "@/shared/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
export default function TabLayout() {
  const { colors } = useAppTheme();

  const textColor = colors.tabIconDefault;
  const iconColor = colors.tabIconSelected;

  return (
    <NativeTabs
      labelStyle={{
        color: textColor,
      }}
      tintColor={iconColor}
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
  );
}
