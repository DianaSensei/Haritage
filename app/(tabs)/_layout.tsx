import React from "react";

import { useColorScheme } from "@/shared/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import {
    Icon,
    Label,
    NativeTabs,
    VectorIcon,
} from "expo-router/unstable-native-tabs";
export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Use appropriate colors based on platform and color scheme
  const textColor = colorScheme === "dark" ? "#ffffff" : "#000000";
  const iconColor = colorScheme === "dark" ? "#ffffff" : "#000000";

  return (
    <NativeTabs
      labelStyle={{
        color: textColor,
      }}
      tintColor={iconColor}
      minimizeBehavior="onScrollDown"
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
