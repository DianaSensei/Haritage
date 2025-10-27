import { CONFIG } from '@/core/config';
import { useAppLockStore } from '@/core/store/slices/appLockSlice';
import { biometricService } from '@/shared/services/security/biometricService';
import { pinService } from '@/shared/services/security/pinService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LockScreenProps {
  onUnlock: () => void;
}

/**
 * Lock Screen Component
 * - PIN entry with custom numeric keypad
 * - Biometric unlock support
 * - Failed attempt tracking with cooldown
 * - Visual feedback and error messages
 */
export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const pinInputRef = useRef<TextInput>(null);
  const hasAttemptedBiometric = useRef(false);

  const {
    failedAttempts,
    cooldownUntil,
    isBiometricEnabled,
    incrementFailedAttempts,
    resetFailedAttempts,
    setCooldown,
    setLocked,
    setLastAuthTimestamp,
    suppressNextLock,
  } = useAppLockStore();

  // Initialize biometric support
  useEffect(() => {
    initializeBiometric();
  }, []);

  // Handle cooldown timer
  useEffect(() => {
    if (!cooldownUntil) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, cooldownUntil - Date.now());
      const seconds = Math.ceil(remaining / 1000);

      if (seconds <= 0) {
        setCooldownSeconds(0);
        setCooldown(null);
        clearInterval(timer);
      } else {
        setCooldownSeconds(seconds);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [cooldownUntil, setCooldown]);

  const initializeBiometric = async () => {
    try {
      const available = await biometricService.isBiometricAvailable();
      setIsBiometricAvailable(available);

      if (available) {
        const type = await biometricService.getBiometricTypeName();
        setBiometricType(type);
      }
    } catch (error) {
      console.error('Error initializing biometric:', error);
    }
  };

  const triggerBiometricUnlock = React.useCallback(async () => {
    if (isBiometricLoading) return;

    setIsBiometricLoading(true);
    try {
      suppressNextLock();
      const authenticated = await biometricService.authenticate();
      if (authenticated) {
        resetFailedAttempts();
        setLocked(false);
        setLastAuthTimestamp(Date.now());
        onUnlock();
      } else {
        setError(`${biometricType} authentication failed. Use PIN instead.`);
      }
    } catch (error) {
      console.error('Biometric error:', error);
      setError('Biometric authentication unavailable');
    } finally {
      setIsBiometricLoading(false);
    }
  }, [
    suppressNextLock,
    biometricType,
    isBiometricLoading,
    onUnlock,
    resetFailedAttempts,
    setLastAuthTimestamp,
    setLocked,
  ]);

  // Attempt auto-unlock with biometric when available
  useEffect(() => {
    if (hasAttemptedBiometric.current) return;
    if (!isBiometricAvailable || !isBiometricEnabled) return;

    hasAttemptedBiometric.current = true;
    triggerBiometricUnlock();
  }, [isBiometricAvailable, isBiometricEnabled, triggerBiometricUnlock]);

  const handlePinChange = (value: string) => {
    if (cooldownSeconds > 0) return;
    const sanitized = value.replace(/\D/g, '').slice(0, CONFIG.APP_LOCK.PIN_LENGTH);
    setPin(sanitized);
    setError('');

    if (sanitized.length === CONFIG.APP_LOCK.PIN_LENGTH) {
      verifyPin(sanitized);
    }
  };

  const verifyPin = async (pinToVerify: string) => {
    try {
      const isValid = await pinService.verifyPin(pinToVerify);

      if (isValid) {
        resetFailedAttempts();
        setLocked(false);
        Keyboard.dismiss();
        setLastAuthTimestamp(Date.now());
        onUnlock();
      } else {
        // Invalid PIN
        Vibration.vibrate(200);
        setPin('');
        setError('Incorrect PIN');

        const newAttempts = failedAttempts + 1;
        incrementFailedAttempts();

        if (newAttempts >= CONFIG.APP_LOCK.MAX_ATTEMPTS) {
          // Set cooldown
          const cooldownMs = CONFIG.APP_LOCK.COOLDOWN_SECONDS * 1000;
          const until = Date.now() + cooldownMs;
          setCooldown(until);
          setError(`Too many attempts. Try again in ${CONFIG.APP_LOCK.COOLDOWN_SECONDS}s`);
        }
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setError('Authentication error. Try again.');
    }
  };

  const isDisabled = cooldownSeconds > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Ionicons name="lock-closed" size={48} color="#0a66c2" />
          <Text style={styles.title}>Unlock Haritage</Text>
          <Text style={styles.subtitle}>Enter your 6-digit PIN</Text>
        </View>

        {/* PIN Display */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => pinInputRef.current?.focus()}
          style={styles.pinDisplayWrapper}
        >
          <View style={styles.pinDisplay}>
            {Array.from({ length: CONFIG.APP_LOCK.PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.pinDot,
                  i < pin.length && styles.pinDotFilled,
                  error && styles.pinDotError,
                ]}
              />
            ))}
          </View>
          <TextInput
            ref={pinInputRef}
            style={styles.hiddenInput}
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            secureTextEntry
            maxLength={CONFIG.APP_LOCK.PIN_LENGTH}
            autoFocus
            editable={!isDisabled}
          />
        </TouchableOpacity>

        {/* Error Message */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Cooldown Message */}
        {cooldownSeconds > 0 && (
          <Text style={styles.cooldownText}>
            Try again in {cooldownSeconds}s
          </Text>
        )}

        {/* Biometric Button */}
        {isBiometricAvailable && isBiometricEnabled && (
          <TouchableOpacity
            style={[styles.biometricButton, isBiometricLoading && styles.biometricButtonDisabled]}
            onPress={triggerBiometricUnlock}
            disabled={isBiometricLoading}
          >
            <Ionicons
              name={biometricType === 'Face ID' ? 'person' : 'finger-print'}
              size={24}
              color="#0a66c2"
            />
            <Text style={styles.biometricButtonText}>
              {isBiometricLoading ? 'Authenticating...' : `Unlock with ${biometricType}`}
            </Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1b',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e4e6eb',
  },
  subtitle: {
    fontSize: 14,
    color: '#818384',
  },
  pinDisplayWrapper: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0a66c2',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#0a66c2',
  },
  pinDotError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 8,
  },
  cooldownText: {
    fontSize: 12,
    color: '#f39c12',
    textAlign: 'center',
    marginBottom: 16,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0a66c2',
    backgroundColor: 'rgba(10, 102, 194, 0.1)',
  },
  biometricButtonDisabled: {
    opacity: 0.6,
  },
  biometricButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a66c2',
  },
});
