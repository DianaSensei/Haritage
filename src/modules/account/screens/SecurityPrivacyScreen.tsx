import { CONFIG } from '@/core/config';
import { useAppLockStore } from '@/core/store/slices/appLockSlice';
import { ThemedText } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';
import { biometricService } from '@/shared/services/security/biometricService';
import { pinService } from '@/shared/services/security/pinService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const FALLBACK_BIOMETRIC_TYPE = '__fallback__';

export const SecurityPrivacyScreen: React.FC = () => {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { t } = useTranslation();
  const pinHash = useAppLockStore((state) => state.pinHash);
  const isBiometricEnabled = useAppLockStore((state) => state.isBiometricEnabled);
  const setBiometricEnabled = useAppLockStore((state) => state.setBiometricEnabled);
  const suppressNextLock = useAppLockStore((state) => state.suppressNextLock);

  const [isCheckingSupport, setIsCheckingSupport] = useState(true);
  const [isProcessingToggle, setIsProcessingToggle] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricTypeKey, setBiometricTypeKey] = useState<string>(FALLBACK_BIOMETRIC_TYPE);

  const biometricTypeLabel =
    biometricTypeKey === FALLBACK_BIOMETRIC_TYPE
      ? t('securityPrivacy.biometricGeneric')
      : biometricTypeKey;

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

          const type = supported ? await biometricService.getBiometricTypeName() : null;

          if (!isMounted) {
            return;
          }

          setIsBiometricSupported(supported);
          setBiometricTypeKey(type?.trim() ? type : FALLBACK_BIOMETRIC_TYPE);
          setBiometricEnabled(storedEnabled);
        } catch (error) {
          console.warn('Failed to hydrate biometric state', error);
          if (isMounted) {
            setIsBiometricSupported(false);
            setBiometricTypeKey(FALLBACK_BIOMETRIC_TYPE);
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
      return t('securityPrivacy.status.checking');
    }

    if (!isBiometricSupported) {
      return t('securityPrivacy.status.notSupported');
    }

    if (!pinHash) {
      return t('securityPrivacy.status.noPin');
    }

    return isBiometricEnabled
      ? t('securityPrivacy.status.enabled', { type: biometricTypeLabel })
      : t('securityPrivacy.status.disabled', { type: biometricTypeLabel });
  }, [
    biometricTypeLabel,
    isBiometricEnabled,
    isBiometricSupported,
    isCheckingSupport,
    pinHash,
    t,
  ]);

  const handleToggleBiometric = useCallback(
    async (nextValue: boolean) => {
      if (isProcessingToggle) {
        return;
      }

      if (!pinHash) {
        Alert.alert(
          t('securityPrivacy.alerts.pinRequired.title'),
          t('securityPrivacy.alerts.pinRequired.body')
        );
        return;
      }

      if (!isBiometricSupported) {
        Alert.alert(
          t('securityPrivacy.alerts.notSupported.title'),
          t('securityPrivacy.alerts.notSupported.body')
        );
        return;
      }

      setIsProcessingToggle(true);
      try {
        if (nextValue) {
          suppressNextLock();
          const authenticated = await biometricService.authenticate();
          if (!authenticated) {
            Alert.alert(
              t('securityPrivacy.alerts.authFailed.title'),
              t('securityPrivacy.alerts.authFailed.body')
            );
            return;
          }
        }

        await pinService.setBiometricEnabled(nextValue);
        setBiometricEnabled(nextValue);
      } catch (error) {
        console.error('Failed to update biometric preference', error);
        Alert.alert(
          t('securityPrivacy.alerts.error.title'),
          t('securityPrivacy.alerts.error.body')
        );
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
      t,
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
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{t('securityPrivacy.title')}</ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={22} color={colors.accent} />
            <ThemedText style={styles.cardTitle}>{t('securityPrivacy.cards.status.title')}</ThemedText>
          </View>
          <ThemedText style={styles.cardDescription}>{statusText}</ThemedText>
          {isCheckingSupport && (
            <ActivityIndicator style={styles.spinner} color={colors.accent} size="small" />
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelGroup}>
              <Ionicons
                name={isBiometricEnabled ? 'finger-print' : 'lock-closed'}
                size={22}
                color={colors.accent}
              />
              <View>
                <ThemedText style={styles.toggleTitle}>
                  {t('securityPrivacy.cards.biometric.title', { type: biometricTypeLabel })}
                </ThemedText>
                <ThemedText style={styles.toggleSubtitle}>
                  {isBiometricSupported
                    ? t('securityPrivacy.cards.biometric.subtitleSupported', {
                        appName: CONFIG.APP_NAME,
                      })
                    : t('securityPrivacy.cards.biometric.subtitleUnsupported')}
                </ThemedText>
              </View>
            </View>
            <Switch
              value={isBiometricEnabled}
              onValueChange={handleToggleBiometric}
              disabled={isToggleDisabled}
              thumbColor={
                isBiometricEnabled
                  ? colors.accent
                  : isDark
                    ? colors.surfaceSecondary
                    : colors.background
              }
              trackColor={{ false: colors.border, true: colors.accent }}
              ios_backgroundColor={colors.border}
            />
          </View>
          {!pinHash && !isCheckingSupport && (
            <ThemedText style={styles.helperText}>
              {t('securityPrivacy.cards.biometric.pinHelper')}
            </ThemedText>
          )}
          {isProcessingToggle && (
            <ThemedText style={styles.helperText}>
              {t('securityPrivacy.cards.biometric.updating')}
            </ThemedText>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={22} color={colors.accent} />
            <ThemedText style={styles.cardTitle}>{t('securityPrivacy.cards.about.title')}</ThemedText>
          </View>
          <ThemedText style={styles.cardDescription}>
            {t('securityPrivacy.cards.about.description', { appName: CONFIG.APP_NAME })}
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (
  colors: ReturnType<typeof useAppTheme>['colors'],
  isDark: boolean,
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: isDark ? colors.surface : colors.surfaceSecondary,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    content: {
      padding: 16,
      gap: 16,
    },
    card: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.35 : 0.12,
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
      color: colors.text,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.textMuted,
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
      color: colors.text,
    },
    toggleSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
    },
    helperText: {
      marginTop: 12,
      fontSize: 13,
      color: colors.warning,
    },
  });
