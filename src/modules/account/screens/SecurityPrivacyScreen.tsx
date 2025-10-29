import { CONFIG } from '@/core/config';
import { useAppLockStore } from '@/core/store/slices/appLockSlice';
import { ThemedText } from '@/shared/components';
import { SettingsHeader } from '@/shared/components/layout/SettingsHeader';
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
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FALLBACK_BIOMETRIC_TYPE = '__fallback__';

export const SecurityPrivacyScreen: React.FC = () => {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

  const biometricSubtitle = useMemo(
    () =>
      isBiometricSupported
        ? t('securityPrivacy.cards.biometric.subtitleSupported', { appName: CONFIG.APP_NAME })
        : t('securityPrivacy.cards.biometric.subtitleUnsupported'),
    [isBiometricSupported, t]
  );

  const biometricFootnotes = useMemo(() => {
    const notes: { key: string; text: string; tone: 'warning' | 'info' }[] = [];

    if (!pinHash && !isCheckingSupport) {
      notes.push({
        key: 'pin-required',
        text: t('securityPrivacy.cards.biometric.pinHelper'),
        tone: 'warning',
      });
    }

    if (isProcessingToggle) {
      notes.push({
        key: 'updating',
        text: t('securityPrivacy.cards.biometric.updating'),
        tone: 'info',
      });
    }

    return notes;
  }, [isCheckingSupport, isProcessingToggle, pinHash, t]);

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
      <SettingsHeader
        title={t('securityPrivacy.title')}
        onBack={() => router.back()}
        backAccessibilityLabel={t('common.goBack')}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.helperCard,
            !isBiometricSupported ? styles.helperCardNeutral : undefined,
          ]}
        >
          <Ionicons
            name={isBiometricSupported ? 'shield-checkmark' : 'shield-outline'}
            size={20}
            color={isBiometricSupported ? colors.info : colors.warning}
          />
          <View style={styles.helperTextGroup}>
            <ThemedText style={styles.helperText}>
              {t('securityPrivacy.cards.status.title')}
            </ThemedText>
            <ThemedText style={styles.helperSubtext}>{statusText}</ThemedText>
          </View>
          {isCheckingSupport && (
            <ActivityIndicator
              style={styles.helperSpinner}
              color={colors.accent}
              size="small"
            />
          )}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('securityPrivacy.cards.biometric.title', { type: biometricTypeLabel })}
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>{biometricSubtitle}</ThemedText>
        </View>

        <View style={styles.optionCard}>
          <View style={styles.optionRow}>
            <View style={styles.optionIcon}>
              <Ionicons
                name={isBiometricEnabled ? 'finger-print' : 'lock-closed'}
                size={18}
                color={colors.accent}
              />
            </View>
            <View style={styles.optionContent}>
              <ThemedText style={styles.optionTitle}>
                {t('securityPrivacy.cards.biometric.title', { type: biometricTypeLabel })}
              </ThemedText>
              <ThemedText style={styles.optionDescription}>{biometricSubtitle}</ThemedText>
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
              trackColor={{ false: colors.borderMuted, true: colors.accent }}
              ios_backgroundColor={colors.borderMuted}
            />
          </View>
          {biometricFootnotes.length > 0 && (
            <View style={styles.optionFootnote}>
              {biometricFootnotes.map((note) => (
                <ThemedText
                  key={note.key}
                  style={
                    note.tone === 'warning' ? styles.footnoteWarning : styles.footnoteInfo
                  }
                >
                  {note.text}
                </ThemedText>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.helperCard, styles.helperCardNeutral]}>
          <Ionicons name="information-circle-outline" size={20} color={colors.icon} />
          <View style={styles.helperTextGroup}>
            <ThemedText style={styles.helperText}>
              {t('securityPrivacy.cards.about.title')}
            </ThemedText>
            <ThemedText style={styles.helperSubtext}>
              {t('securityPrivacy.cards.about.description', { appName: CONFIG.APP_NAME })}
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 20,
    },
    helperCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.infoSoft,
      borderWidth: 1,
      borderColor: colors.info,
    },
    helperCardNeutral: {
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
    },
    helperTextGroup: {
      flex: 1,
      gap: 4,
    },
    helperText: {
      fontSize: 14,
      color: colors.text,
    },
    helperSubtext: {
      fontSize: 13,
      color: colors.textMuted,
    },
    helperSpinner: {
      marginLeft: 12,
    },
    section: {
      gap: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    sectionDescription: {
      fontSize: 14,
      color: colors.textMuted,
    },
    optionCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 16,
    },
    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.borderMuted,
    },
    optionContent: {
      flex: 1,
      gap: 4,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    optionDescription: {
      fontSize: 13,
      color: colors.textMuted,
    },
    optionFootnote: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.borderMuted,
      backgroundColor: colors.surfaceSecondary,
    },
    footnoteWarning: {
      fontSize: 13,
      color: colors.warning,
    },
    footnoteInfo: {
      fontSize: 13,
      color: colors.textMuted,
    },
  });
