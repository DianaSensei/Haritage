import { CONFIG } from '@/core/config';
import { useAppLockStore } from '@/core/store/slices/appLockSlice';
import { biometricService } from '@/shared/services/security/biometricService';
import { pinService } from '@/shared/services/security/pinService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PINSetupScreenProps {
  onComplete: () => void;
}

type SetupStep = 'create' | 'confirm' | 'biometric' | 'complete';

/**
 * PIN Setup Screen Component
 * - 6-digit PIN creation and confirmation
 * - Biometric enablement option
 * - Skip option for later setup
 * - Input validation and visual feedback
 */
export const PINSetupScreen: React.FC<PINSetupScreenProps> = ({ onComplete }) => {
  const { setPinHash, setBiometricEnabled, setPinSetupRequired } = useAppLockStore();

  const [step, setStep] = useState<SetupStep>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    initializeBiometric();
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

  const handleNumberPress = (num: string) => {
    const currentPin = step === 'create' ? pin : confirmPin;
    if (currentPin.length >= CONFIG.APP_LOCK.PIN_LENGTH) return;

    const newPin = currentPin + num;

    if (step === 'create') {
      setPin(newPin);
      setError('');

      if (newPin.length === CONFIG.APP_LOCK.PIN_LENGTH) {
        setError('PIN created. Confirm it on the next screen.');
      }
    } else {
      setConfirmPin(newPin);
      setError('');

      if (newPin.length === CONFIG.APP_LOCK.PIN_LENGTH) {
        verifyAndSavePIN(pin, newPin);
      }
    }
  };

  const handleBackspace = () => {
    if (step === 'create') {
      setPin(pin.slice(0, -1));
      setError('');
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
      setError('');
    }
  };

  const verifyAndSavePIN = async (createPin: string, confirmPinInput: string) => {
    if (createPin !== confirmPinInput) {
      Vibration.vibrate(200);
      setConfirmPin('');
      setError('PINs do not match. Try again.');
      return;
    }

    setIsLoading(true);
    try {
      const hash = await pinService.hashPin(createPin);
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
    setPinSetupRequired(false);
    onComplete();
  };

  const handleSkip = async () => {
    // User can skip and set up later
    setPinSetupRequired(false);
    onComplete();
  };

  const handleClear = () => {
    if (step === 'create') {
      setPin('');
    } else {
      setConfirmPin('');
    }
    setError('');
  };

  const isDisabled = isLoading;
  const currentPin = step === 'create' ? pin : confirmPin;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            {step === 'create' && (
              <>
                <Ionicons name="lock-closed" size={48} color="#0a66c2" />
                <Text style={styles.title}>Create Your PIN</Text>
                <Text style={styles.subtitle}>Set up a 6-digit PIN to secure your account</Text>
              </>
            )}
            {step === 'confirm' && (
              <>
                <Ionicons name="checkmark-circle" size={48} color="#0a66c2" />
                <Text style={styles.title}>Confirm Your PIN</Text>
                <Text style={styles.subtitle}>Re-enter your PIN to confirm</Text>
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
          {step !== 'biometric' && (
            <View style={styles.pinDisplay}>
              {Array.from({ length: CONFIG.APP_LOCK.PIN_LENGTH }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.pinDot, i < currentPin.length && styles.pinDotFilled]}
                />
              ))}
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

          {/* Numeric Keypad */}
          {step !== 'biometric' && (
            <>
              <View style={styles.keypad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.key, isDisabled && styles.keyDisabled]}
                    onPress={() => handleNumberPress(num.toString())}
                    disabled={isDisabled}
                  >
                    <Text style={styles.keyText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.bottomRow}>
                <TouchableOpacity
                  style={[styles.key, styles.backspaceKey, isDisabled && styles.keyDisabled]}
                  onPress={handleBackspace}
                  disabled={isDisabled}
                >
                  <Ionicons name="backspace-outline" size={24} color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.key, isDisabled && styles.keyDisabled]}
                  onPress={() => handleNumberPress('0')}
                  disabled={isDisabled}
                >
                  <Text style={styles.keyText}>0</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.key, styles.clearKey, isDisabled && styles.keyDisabled]}
                  onPress={handleClear}
                  disabled={isDisabled}
                >
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Step Indicator */}
              {step === 'create' && currentPin.length === CONFIG.APP_LOCK.PIN_LENGTH && (
                <TouchableOpacity
                  style={[styles.nextButton, isDisabled && styles.nextButtonDisabled]}
                  onPress={() => {
                    setStep('confirm');
                    setConfirmPin('');
                  }}
                  disabled={isDisabled}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Skip Button */}
          {step === 'create' && currentPin.length === 0 && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={isDisabled}>
              <Text style={styles.skipButtonText}>Skip for Now</Text>
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
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
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
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  key: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#272729',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#343536',
  },
  keyDisabled: {
    opacity: 0.5,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backspaceKey: {
    width: '30%',
  },
  clearKey: {
    width: '30%',
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
