import { useAuthStore } from '@/core/store/slices/authSlice';
import { useFeedStore } from '@/core/store/slices/feedSlice';
import { Radii, Spacing, Typography } from '@/core/config/theme';
import { userService } from '@/modules/account/services/userService';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { ThemedText } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  isDanger?: boolean;
}

export const AccountScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const updateUser = useAuthStore((state) => state.updateUser);
  const syncAuthorAvatar = useFeedStore((state) => state.updateAuthorAvatar);
  const router = useRouter();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const joinedDate = useMemo(() => {
    if (!user?.createdAt) {
      return null;
    }

    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';

    return new Date(user.createdAt).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [user?.createdAt, i18n.language]);

  const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress, isDanger }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.72}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons
          name={icon as any}
          size={20}
          color={isDanger ? colors.danger : colors.accent}
        />
        <ThemedText
          style={[
            styles.menuLabel,
            isDanger ? styles.menuLabelDanger : undefined,
          ]}
        >
          {label}
        </ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
    </TouchableOpacity>
  );

  const handleAvatarPress = useCallback(async () => {
    if (isUploadingAvatar) {
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          t('account.alerts.permissionTitle'),
          t('account.alerts.permissionBody')
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
        exif: false,
      });

      if (pickerResult.canceled || !pickerResult.assets?.length) {
        return;
      }

      const [asset] = pickerResult.assets;
      if (!asset?.uri) {
        Alert.alert(
          t('account.alerts.selectionFailedTitle'),
          t('account.alerts.selectionFailedBody')
        );
        return;
      }

      setIsUploadingAvatar(true);

      const uploadResult = await userService.uploadAvatar(asset.uri);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || t('account.alerts.uploadFailedFallback'));
      }

      const nextAvatar = uploadResult.data.avatarUrl;
      updateUser({ avatar: nextAvatar, updatedAt: new Date() });

      if (user?.id) {
        syncAuthorAvatar(String(user.id), nextAvatar);
      }

      Alert.alert(
        t('account.alerts.uploadSuccessTitle'),
        t('account.alerts.uploadSuccessBody')
      );
    } catch (error) {
      const fallbackMessage = t('account.errors.unknown');
      const message =
        error instanceof Error && error.message ? error.message : fallbackMessage;
      Alert.alert(t('account.alerts.uploadFailedTitle'), message);
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [isUploadingAvatar, t, updateUser, user?.id, syncAuthorAvatar]);

  const handleLogout = () => {
    Alert.alert(
      t('account.alerts.logoutTitle'),
      t('account.alerts.logoutBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('account.menu.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Logging out...');
              await logout();
              console.log('Logged out - store cleared');
              try {
                router.replace('/');
              } catch (e) {
                console.warn('Router replace failed', e);
              }
              Alert.alert(
                t('account.alerts.logoutSuccessTitle'),
                t('account.alerts.logoutSuccess')
              );
            } catch (err) {
              console.error('Logout failed', err);
              const message =
                err instanceof Error && err.message ? err.message : t('account.errors.unknown');
              Alert.alert(t('account.alerts.logoutFailedTitle'), message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = useCallback(() => {
    Alert.alert(t('account.buttons.editProfile'), t('account.alerts.editProfileBody'));
  }, [t]);
  const handleSecurity = useCallback(() => {
    router.push('/security-privacy');
  }, [router]);
  const handleSavedFeeds = useCallback(() => {
    router.push('/saved-feeds');
  }, [router]);
  const handleSettings = useCallback(() => {
    router.push('/app-settings');
  }, [router]);
  const handleHelp = useCallback(() => {
    router.push('/help-support');
  }, [router]);
  const handleDebug = useCallback(() => {
    router.push('/debug-tools');
  }, [router]);
  const handleMyBookings = useCallback(() => {
    router.push('/my-bookings');
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={16} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.avatarContainer, isUploadingAvatar && styles.avatarLoading]}
            onPress={handleAvatarPress}
            activeOpacity={0.85}
            disabled={isUploadingAvatar}
          >
            <View style={styles.avatarWrapper}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color={colors.accent} />
                </View>
              )}

              {isUploadingAvatar && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color="#ffffff" size="small" />
                </View>
              )}

              <View style={[styles.cameraBadge, isUploadingAvatar && styles.cameraBadgeDisabled]}>
                <Ionicons name="camera" size={14} color="#ffffff" />
              </View>
            </View>
          </TouchableOpacity>

          <ThemedText style={styles.userName}>{user?.name ?? t('account.guestUser')}</ThemedText>

          {/* Info Section */}
          <View style={styles.infoSection}>
            {user?.phoneNumber && (
              <View style={styles.infoRow}>
                <Ionicons name="phone-portrait" size={16} color={colors.accent} />
                <ThemedText style={styles.infoLabel}>{t('account.info.phone')}</ThemedText>
                <ThemedText style={styles.infoValue}>{user.phoneNumber}</ThemedText>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              </View>
            )}

            {user?.email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={16} color={colors.accent} />
                <ThemedText style={styles.infoLabel}>{t('account.info.email')}</ThemedText>
                <ThemedText style={styles.infoValue}>{user.email}</ThemedText>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              </View>
            )}

            {joinedDate && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={16} color={colors.accent} />
                <ThemedText style={styles.infoLabel}>{t('account.info.joined')}</ThemedText>
                <ThemedText style={styles.infoValue}>{joinedDate}</ThemedText>
              </View>
            )}
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <ThemedText style={styles.statusText}>{t('account.statusActive')}</ThemedText>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('account.sections.settings')}
          </ThemedText>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="shield-checkmark"
              label={t('account.menu.securityPrivacy')}
              onPress={handleSecurity}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="calendar-outline"
              label="My Bookings"
              onPress={handleMyBookings}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="bookmark"
              label={t('account.menu.savedFeeds')}
              onPress={handleSavedFeeds}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="settings"
              label={t('account.menu.appSettings')}
              onPress={handleSettings}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="help-circle"
              label={t('account.menu.helpSupport')}
              onPress={handleHelp}
            />
          </View>
        </View>

        {/* Debug Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('account.sections.debug')}
          </ThemedText>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="code-working"
              label={t('account.menu.debugTools')}
              onPress={handleDebug}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('account.sections.account')}
          </ThemedText>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="log-out"
              label={t('account.menu.logout')}
              onPress={handleLogout}
              isDanger={true}
            />
          </View>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>{t('account.helper.version')}</ThemedText>
          <ThemedText style={styles.footerSubtext}>
            {t('common.ownedBy', { year: 2025 })}
          </ThemedText>
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
    scrollContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      backgroundColor: colors.card,
    },
    headerTitle: {
      fontSize: Typography.size.xxxl,
      lineHeight: Typography.lineHeight.xxxl,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.tight,
    },
    profileCard: {
      marginHorizontal: Spacing.lg,
      marginVertical: Spacing.lg,
      paddingVertical: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      backgroundColor: colors.card,
      borderRadius: Radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    editButton: {
      position: 'absolute',
      top: Spacing.md,
      right: Spacing.md,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    avatarContainer: {
      marginBottom: Spacing.lg,
      position: 'relative',
    },
    avatarWrapper: {
      position: 'relative',
      width: 80,
      height: 80,
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: colors.accent,
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 2,
      borderColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: colors.overlay,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarLoading: {
      opacity: 0.85,
    },
    cameraBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.accent,
      borderWidth: 2,
      borderColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    cameraBadgeDisabled: {
      backgroundColor: colors.surfaceTertiary,
      shadowOpacity: 0,
    },
    userName: {
      fontSize: Typography.size.xl,
      lineHeight: Typography.lineHeight.xl,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginBottom: Spacing.lg,
      textAlign: 'center',
    },
    infoSection: {
      width: '100%',
      marginBottom: Spacing.lg,
      gap: Spacing.sm,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: Radii.sm,
      borderWidth: 1,
      borderColor: colors.border,
      gap: Spacing.sm,
    },
    infoLabel: {
      fontSize: Typography.size.xs,
      lineHeight: Typography.lineHeight.xs,
      fontWeight: Typography.weight.semibold,
      color: colors.textMuted,
      width: 60,
    },
    infoValue: {
      fontSize: Typography.size.sm,
      lineHeight: Typography.lineHeight.sm,
      color: colors.text,
      flex: 1,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      backgroundColor: colors.successSoft,
      borderRadius: Radii.pill,
      borderWidth: 1,
      borderColor: colors.success,
      gap: Spacing.xs,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.success,
    },
    statusText: {
      fontSize: Typography.size.xs,
      lineHeight: Typography.lineHeight.xs,
      fontWeight: Typography.weight.semibold,
      color: colors.success,
    },
    section: {
      marginHorizontal: Spacing.lg,
      marginVertical: Spacing.lg,
      gap: Spacing.md,
    },
    sectionTitle: {
      fontSize: Typography.size.sm,
      lineHeight: Typography.lineHeight.sm,
      fontWeight: Typography.weight.bold,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: Typography.letterSpacing.wide,
    },
    menuContainer: {
      backgroundColor: colors.card,
      borderRadius: Radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      shadowColor: colors.shadowSubtle,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      backgroundColor: colors.card,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: Spacing.md,
    },
    menuLabel: {
      fontSize: Typography.size.md,
      lineHeight: Typography.lineHeight.md,
      fontWeight: Typography.weight.medium,
      color: colors.text,
    },
    menuLabelDanger: {
      color: colors.danger,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      gap: Spacing.xs,
    },
    footerText: {
      fontSize: Typography.size.sm,
      lineHeight: Typography.lineHeight.sm,
      fontWeight: Typography.weight.semibold,
      color: colors.textMuted,
    },
    footerSubtext: {
      fontSize: Typography.size.xs,
      lineHeight: Typography.lineHeight.xs,
      color: colors.iconMuted,
    },
  });
