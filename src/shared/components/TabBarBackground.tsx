import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function TabBarBackground() {
  return (
    <BlurView intensity={100} style={StyleSheet.absoluteFill} tint="systemUltraThinMaterial">
      <View style={styles.background} />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
});