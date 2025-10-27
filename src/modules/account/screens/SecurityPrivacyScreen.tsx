import { useAppLockStore } from '@/core/store/slices/appLockSlice';
import { ThemedText } from '@/shared/components';
import { biometricService } from '@/shared/services/security/biometricService';
import { pinService } from '@/shared/services/security/pinService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SecurityPrivacyScreen: React.FC = () => {
  const router = useRouter();
  const pinHash = useAppLockStore((state) => state.pinHash);
  const isBiometricEnabled = useAppLockStore((state) => state.isBiometricEnabled);
  const setBiometricEnabled = useAppLockStore((state) => state.setBiometricEnabled);
  const suppressNextLock = useAppLockStore((state) => state.suppressNextLock);

  const [isCheckingSupport, setIsCheckingSupport] = useState(true);
  const [isProcessingToggle, setIsProcessingToggle] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const hydrateState = async () => {
        setIsCheckingSupport(true);
        try {
          const [supported, storedEnabled] = await Promise.all([
            biometricService.isBiometricAvailable(),
            pinService.isBiometricEnabled(),
          ]);

          const type = supported ? await biometricService.getBiometricTypeName() : 'Biometric';

          if (!isMounted) {
            return;
          }

          setIsBiometricSupported(supported);
          setBiometricType(type);
          setBiometricEnabled(storedEnabled);
        } catch (error) {
          console.warn('Failed to hydrate biometric state', error);
          if (isMounted) {
            setIsBiometricSupported(false);
          }
        } finally {
          if (isMounted) {
            setIsCheckingSupport(false);
          }
        }
      };

      hydrateState();

      return () => {
        isMounted = false;
      };
    }, [setBiometricEnabled])
  );

  const statusText = useMemo(() => {
    if (isCheckingSupport) {
      return 'Checking device support...';
    }

    if (!isBiometricSupported) {
      return 'Biometric authentication is not available on this device.';
    }

    if (!pinHash) {
      return 'Set up a PIN to enable biometric unlocking.';
    }

    return isBiometricEnabled
      ? `${biometricType} unlock is currently enabled.`
      : `${biometricType} unlock is currently disabled.`;
  }, [
    biometricType,
    isBiometricEnabled,
    isBiometricSupported,
    isCheckingSupport,
    pinHash,
  ]);

  const handleToggleBiometric = useCallback(
    async (nextValue: boolean) => {
      if (isProcessingToggle) {
        return;
      }

      if (!pinHash) {
        Alert.alert('PIN required', 'Please create a PIN before enabling biometrics.');
        return;
      }

      if (!isBiometricSupported) {
        Alert.alert('Not supported', 'This device does not support biometric authentication.');
        return;
      }

      setIsProcessingToggle(true);
      try {
        if (nextValue) {
          suppressNextLock();
          const authenticated = await biometricService.authenticate();
          if (!authenticated) {
            Alert.alert('Authentication failed', 'Biometric authentication was canceled or failed.');
            return;
          }
        }

        await pinService.setBiometricEnabled(nextValue);
        setBiometricEnabled(nextValue);
      } catch (error) {
        console.error('Failed to update biometric preference', error);
        Alert.alert('Error', 'Could not update biometric preference. Try again later.');
      } finally {
        setIsProcessingToggle(false);
      }
    },
    [
      isBiometricSupported,
      isProcessingToggle,
      pinHash,
      setBiometricEnabled,
      suppressNextLock,
    ]
  );

  const isToggleDisabled = useMemo(() => {
    if (isCheckingSupport || isProcessingToggle) {
      return true;
    }
    if (!isBiometricSupported || !pinHash) {
      return true;
    }
    return false;
  }, [
    isBiometricSupported,
    isCheckingSupport,
    isProcessingToggle,
    pinHash,
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#e4e6eb" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Security & Privacy</ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={22} color="#0a66c2" />
            <ThemedText style={styles.cardTitle}>App Lock Status</ThemedText>
          </View>
          <ThemedText style={styles.cardDescription}>{statusText}</ThemedText>
          {isCheckingSupport && (
            <ActivityIndicator style={styles.spinner} color="#0a66c2" size="small" />
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelGroup}>
              <Ionicons
                name={isBiometricEnabled ? 'finger-print' : 'lock-closed'}
                size={22}
                color="#0a66c2"
              />
              <View>
                <ThemedText style={styles.toggleTitle}>{biometricType} Unlock</ThemedText>
                <ThemedText style={styles.toggleSubtitle}>
                  {isBiometricSupported ? 'Use biometrics to unlock Haritage.' : 'Unavailable on this device.'}
                </ThemedText>
              </View>
            </View>
            <Switch
              value={isBiometricEnabled}
              onValueChange={handleToggleBiometric}
              disabled={isToggleDisabled}
              thumbColor={isBiometricEnabled ? '#0a66c2' : '#b1b2b6'}
              trackColor={{ false: '#3a3b3c', true: '#0a66c2' }}
            />
          </View>
          {!pinHash && !isCheckingSupport && (
            <ThemedText style={styles.helperText}>
              Create a PIN to enable biometric unlocking.
            </ThemedText>
          )}
          {isProcessingToggle && (
            <ThemedText style={styles.helperText}>Updating preference...</ThemedText>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={22} color="#0a66c2" />
            <ThemedText style={styles.cardTitle}>About Biometrics</ThemedText>
          </View>
          <ThemedText style={styles.cardDescription}>
            Haritage uses your device biometrics through the operating system. We never store raw biometric data and you can disable access at any time.
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#343536',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#272729',
    borderWidth: 1,
    borderColor: '#404142',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e4e6eb',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#272729',
    borderWidth: 1,
    borderColor: '#404142',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e4e6eb',
  },
  cardDescription: {
    fontSize: 14,
    color: '#b1b2b6',
    lineHeight: 20,
  },
  spinner: {
    marginTop: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  toggleLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e4e6eb',
  },
  toggleSubtitle: {
    fontSize: 13,
    color: '#818384',
  },
  helperText: {
    marginTop: 12,
    fontSize: 13,
    color: '#f39c12',
  },
});
