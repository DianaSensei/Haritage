import { CONFIG } from '@/core/config';
import { useAppLockStore } from '@/core/store/slices/appLockSlice';
import { biometricService } from '@/shared/services/security/biometricService';
import { pinService } from '@/shared/services/security/pinService';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PINSetupScreenProps {
  onComplete: () => void;
}

type SetupStep = 'pin' | 'biometric';

/**
 * PIN Setup Screen Component
 * - 6-digit PIN creation and confirmation
 * - Biometric enablement option
 * - Skip option for later setup
 * - Input validation and visual feedback
 */
export const PINSetupScreen: React.FC<PINSetupScreenProps> = ({ onComplete }) => {
  const { setPinHash, setBiometricEnabled, setPinSetupRequired } = useAppLockStore();

  const [step, setStep] = useState<SetupStep>('pin');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [isLoading, setIsLoading] = useState(false);
  const pinInputRef = useRef<TextInput>(null);
  const confirmInputRef = useRef<TextInput>(null);

  React.useEffect(() => {
    initializeBiometric();
    pinInputRef.current?.focus();
  }, []);

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

  const handlePinChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, CONFIG.APP_LOCK.PIN_LENGTH);
    setPin(sanitized);
    setError('');

    if (sanitized.length === CONFIG.APP_LOCK.PIN_LENGTH) {
      confirmInputRef.current?.focus();
    }
  };

  const handleConfirmPinChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, CONFIG.APP_LOCK.PIN_LENGTH);
    setConfirmPin(sanitized);
    setError('');

    if (sanitized.length === CONFIG.APP_LOCK.PIN_LENGTH) {
      verifyAndSavePIN();
    }
  };

  const verifyAndSavePIN = async () => {
    if (pin.length !== CONFIG.APP_LOCK.PIN_LENGTH || confirmPin.length !== CONFIG.APP_LOCK.PIN_LENGTH) {
      setError('Enter and confirm your 6-digit PIN.');
      pinInputRef.current?.focus();
      return;
    }

    if (pin !== confirmPin) {
      Vibration.vibrate(200);
      setConfirmPin('');
      setError('PINs do not match. Try again.');
      setTimeout(() => confirmInputRef.current?.focus(), 100);
      return;
    }

    setIsLoading(true);
    try {
      const hash = await pinService.hashPin(pin);
      await pinService.storePinHash(hash);
      setPinHash(hash);

      if (isBiometricAvailable) {
        setStep('biometric');
      } else {
        completeSetup(false);
      }
    } catch (error) {
      console.error('Error saving PIN:', error);
      setError('Error saving PIN. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricEnable = async (enable: boolean) => {
    setIsLoading(true);
    try {
      await pinService.setBiometricEnabled(enable);
      setBiometricEnabled(enable);
      completeSetup(true);
    } catch (error) {
      console.error('Error enabling biometric:', error);
      setError('Error saving preference. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeSetup = async (biometricEnabled: boolean) => {
    await pinService.setPinSetupRequired(false);
    setPinSetupRequired(false);
    if (!biometricEnabled) {
      await pinService.setBiometricEnabled(false);
      setBiometricEnabled(false);
    }
    onComplete();
  };

  const isDisabled = isLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            {step === 'pin' && (
              <>
                <Ionicons name="lock-closed" size={48} color="#0a66c2" />
                <Text style={styles.title}>Create Your PIN</Text>
                <Text style={styles.subtitle}>Enter and confirm your 6-digit PIN to secure your account</Text>
              </>
            )}
            {step === 'biometric' && (
              <>
                <Ionicons name="finger-print" size={48} color="#0a66c2" />
                <Text style={styles.title}>Enable {biometricType}</Text>
                <Text style={styles.subtitle}>
                  Unlock Haritage quickly with {biometricType}
                </Text>
              </>
            )}
          </View>

          {/* PIN Display */}
          {step === 'pin' && (
            <View style={styles.pinSection}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => pinInputRef.current?.focus()}
                style={styles.pinDisplayWrapper}
              >
                <Text style={styles.pinLabel}>Create PIN</Text>
                <View style={styles.pinDisplay}>
                  {Array.from({ length: CONFIG.APP_LOCK.PIN_LENGTH }).map((_, i) => (
                    <View key={`pin-${i}`} style={[styles.pinBox, pin[i] && styles.pinBoxFilled]}>
                      <Text style={styles.pinBoxText}>{pin[i] ? '•' : ''}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => confirmInputRef.current?.focus()}
                style={styles.pinDisplayWrapper}
              >
                <Text style={styles.pinLabel}>Confirm PIN</Text>
                <View style={styles.pinDisplay}>
                  {Array.from({ length: CONFIG.APP_LOCK.PIN_LENGTH }).map((_, i) => (
                    <View
                      key={`confirm-${i}`}
                      style={[styles.pinBox, confirmPin[i] && styles.pinBoxFilled, error && styles.pinBoxError]}
                    >
                      <Text style={styles.pinBoxText}>{confirmPin[i] ? '•' : ''}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>

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
              />
              <TextInput
                ref={confirmInputRef}
                style={styles.hiddenInput}
                value={confirmPin}
                onChangeText={handleConfirmPinChange}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                secureTextEntry
                maxLength={CONFIG.APP_LOCK.PIN_LENGTH}
              />
            </View>
          )}

          {/* Error Message */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Biometric Options */}
          {step === 'biometric' && (
            <View style={styles.biometricOptions}>
              <TouchableOpacity
                style={[styles.biometricChoice, styles.enableButton]}
                onPress={() => handleBiometricEnable(true)}
                disabled={isDisabled}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color="#27ae60" />
                <Text style={styles.enableButtonText}>Enable {biometricType}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.biometricChoice, styles.disableButton]}
                onPress={() => handleBiometricEnable(false)}
                disabled={isDisabled}
              >
                <Ionicons name="close-circle-outline" size={24} color="#818384" />
                <Text style={styles.disableButtonText}>Use PIN Only</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Next Button & clear */}
          {step === 'pin' && (
            <TouchableOpacity
              style={[styles.nextButton, !(pin.length === CONFIG.APP_LOCK.PIN_LENGTH && confirmPin.length === CONFIG.APP_LOCK.PIN_LENGTH) && styles.nextButtonDisabled]}
              onPress={verifyAndSavePIN}
              disabled={isDisabled || pin.length !== CONFIG.APP_LOCK.PIN_LENGTH || confirmPin.length !== CONFIG.APP_LOCK.PIN_LENGTH}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    flexGrow: 1,
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
    textAlign: 'center',
  },
  pinSection: {
    gap: 24,
    marginBottom: 32,
  },
  pinDisplayWrapper: {
    gap: 12,
  },
  pinLabel: {
    fontSize: 14,
    color: '#b1b2b6',
    fontWeight: '600',
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  pinBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#343536',
    backgroundColor: '#1f1f20',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pinBoxFilled: {
    borderColor: '#0a66c2',
    backgroundColor: '#23273a',
  },
  pinBoxError: {
    borderColor: '#e74c3c',
  },
  pinBoxText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e4e6eb',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  nextButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#0a66c2',
    alignItems: 'center',
    marginTop: 16,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  biometricOptions: {
    gap: 12,
    marginTop: 32,
  },
  biometricChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  enableButton: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    borderColor: '#27ae60',
  },
  enableButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    flex: 1,
  },
  disableButton: {
    backgroundColor: 'rgba(129, 131, 132, 0.1)',
    borderColor: '#343536',
  },
  disableButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#818384',
    flex: 1,
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#343536',
    alignItems: 'center',
    marginTop: 16,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#818384',
  },
});
