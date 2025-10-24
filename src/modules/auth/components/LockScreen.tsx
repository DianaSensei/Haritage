import { CONFIG } from '@/core/config';
import { IconSymbol } from '@/shared/components';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../services/authService';
import { pinService } from '../services/pinService';

interface LockScreenProps {
  onUnlock: () => void;
  allowBiometric?: boolean;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, allowBiometric = true }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    if (!allowBiometric) return;
    
    const available = await authService.isBiometricAvailable();
    const enabled = await authService.isBiometricEnabled();
    setBiometricAvailable(available && enabled);

    // Auto-trigger biometric if available
    if (available && enabled) {
      setTimeout(() => handleBiometric(), 500);
    }
  };

  const handleBiometric = async () => {
    try {
      const success = await authService.authenticateWithBiometric();
      if (success) {
        await pinService.updateLastAuthenticated();
        onUnlock();
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
    }
  };

  const handleNumberPress = (num: string) => {
    if (pin.length >= CONFIG.AUTH.PIN_LENGTH) return;
    
    const newPin = pin + num;
    setPin(newPin);
    setError('');

    // Auto-verify when PIN is complete
    if (newPin.length === CONFIG.AUTH.PIN_LENGTH) {
      setTimeout(() => verifyPin(newPin), 100);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const verifyPin = async (pinToVerify: string) => {
    const isValid = await pinService.verifyPin(pinToVerify);
    
    if (isValid) {
      await pinService.updateLastAuthenticated();
      setPin('');
      onUnlock();
    } else {
      Vibration.vibrate(500);
      setError('Incorrect PIN');
      setPin('');
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= CONFIG.AUTH.MAX_LOGIN_ATTEMPTS) {
        Alert.alert(
          'Too Many Attempts',
          'You have exceeded the maximum number of attempts. Please try again later or contact support.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const renderPinDots = () => {
    const dots = [];
    for (let i = 0; i < CONFIG.AUTH.PIN_LENGTH; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.pinDot,
            {
              backgroundColor: i < pin.length ? tintColor : 'transparent',
              borderColor: tintColor,
            },
          ]}
        />
      );
    }
    return dots;
  };

  const renderNumberPad = () => {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];
    
    return (
      <View style={styles.numberPad}>
        {numbers.map((num, index) => {
          if (num === '') {
            return <View key={index} style={styles.numberButton} />;
          }
          
          if (num === 'delete') {
            return (
              <TouchableOpacity
                key={index}
                style={styles.numberButton}
                onPress={handleDelete}
                disabled={pin.length === 0}
              >
                <IconSymbol name="delete.backward" size={28} color={pin.length === 0 ? '#ccc' : textColor} />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={index}
              style={styles.numberButton}
              onPress={() => handleNumberPress(num)}
            >
              <Text style={[styles.numberText, { color: textColor }]}>{num}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <IconSymbol name="lock.shield" size={64} color={tintColor} />
          <Text style={[styles.title, { color: textColor }]}>Enter PIN</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>
            Enter your {CONFIG.AUTH.PIN_LENGTH}-digit PIN to unlock
          </Text>
        </View>

        <View style={styles.pinContainer}>
          <View style={styles.pinDots}>{renderPinDots()}</View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {renderNumberPad()}

        {biometricAvailable && (
          <TouchableOpacity style={styles.biometricButton} onPress={handleBiometric}>
            <IconSymbol name="faceid" size={32} color={tintColor} />
            <Text style={[styles.biometricText, { color: tintColor }]}>Use Biometric</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  pinContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  pinDots: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 8,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  numberButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 32,
    fontWeight: '400',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
