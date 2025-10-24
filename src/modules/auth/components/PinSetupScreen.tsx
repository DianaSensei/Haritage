import { CONFIG } from '@/core/config';
import { IconSymbol } from '@/shared/components';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pinService } from '../services/pinService';

interface PinSetupScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
  allowSkip?: boolean;
}

export const PinSetupScreen: React.FC<PinSetupScreenProps> = ({ 
  onComplete, 
  onSkip,
  allowSkip = false 
}) => {
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const getCurrentPin = () => (step === 'enter' ? firstPin : confirmPin);
  const setCurrentPin = (pin: string) => {
    if (step === 'enter') {
      setFirstPin(pin);
    } else {
      setConfirmPin(pin);
    }
  };

  const handleNumberPress = (num: string) => {
    const currentPin = getCurrentPin();
    if (currentPin.length >= CONFIG.AUTH.PIN_LENGTH) return;
    
    const newPin = currentPin + num;
    setCurrentPin(newPin);
    setError('');

    // Auto-advance when PIN is complete
    if (newPin.length === CONFIG.AUTH.PIN_LENGTH) {
      if (step === 'enter') {
        setTimeout(() => {
          setStep('confirm');
        }, 200);
      } else {
        setTimeout(() => handleConfirm(newPin), 200);
      }
    }
  };

  const handleDelete = () => {
    const currentPin = getCurrentPin();
    setCurrentPin(currentPin.slice(0, -1));
    setError('');
  };

  const handleConfirm = async (pinToConfirm: string) => {
    if (pinToConfirm !== firstPin) {
      Vibration.vibrate(500);
      setError('PINs do not match');
      setConfirmPin('');
      setStep('enter');
      setFirstPin('');
      return;
    }

    const success = await pinService.setPin(pinToConfirm);
    if (success) {
      await pinService.updateLastAuthenticated();
      onComplete();
    } else {
      setError('Failed to set PIN');
      setConfirmPin('');
      setStep('enter');
      setFirstPin('');
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      Alert.alert(
        'Skip PIN Setup',
        'You can set up a PIN later in settings. Your account will be less secure without a PIN.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Skip', style: 'destructive', onPress: onSkip },
        ]
      );
    }
  };

  const renderPinDots = () => {
    const currentPin = getCurrentPin();
    const dots = [];
    for (let i = 0; i < CONFIG.AUTH.PIN_LENGTH; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.pinDot,
            {
              backgroundColor: i < currentPin.length ? tintColor : 'transparent',
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
    const currentPin = getCurrentPin();
    
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
                disabled={currentPin.length === 0}
              >
                <IconSymbol 
                  name="delete.backward" 
                  size={28} 
                  color={currentPin.length === 0 ? '#ccc' : textColor} 
                />
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
          <Text style={[styles.title, { color: textColor }]}>
            {step === 'enter' ? 'Set Up PIN' : 'Confirm PIN'}
          </Text>
          <Text style={[styles.subtitle, { color: textColor }]}>
            {step === 'enter'
              ? `Enter a ${CONFIG.AUTH.PIN_LENGTH}-digit PIN`
              : 'Re-enter your PIN to confirm'}
          </Text>
        </View>

        <View style={styles.pinContainer}>
          <View style={styles.pinDots}>{renderPinDots()}</View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {renderNumberPad()}

        {allowSkip && step === 'enter' && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={[styles.skipText, { color: tintColor }]}>Skip for now</Text>
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
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
