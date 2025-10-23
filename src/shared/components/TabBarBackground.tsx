import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function TabBarBackground() {
  return (
    <View style={styles.container}>
      <BlurView intensity={50} style={styles.blurView} tint="systemUltraThinMaterial">
        <View style={styles.overlay} />
        <View style={styles.innerGlow} />
      </BlurView>
      <View style={styles.topBorder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    shadowColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
  },
  topBorder: {
    position: 'absolute',
    top: 8,
    left: 16,
    right: 16,
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 0.25,
  },
});