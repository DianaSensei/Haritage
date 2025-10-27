import { useAuthStore } from '@/core/store/slices/authSlice';
import { useFeedStore } from '@/core/store/slices/feedSlice';
import { userService } from '@/modules/account/services/userService';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { ThemedText } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
  const styles = useMemo(() => createStyles(colors), [colors]);

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
          'Permission required',
          'Allow access to your photos so you can choose a new avatar.'
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
        Alert.alert('Selection failed', 'We could not read this image. Please try another one.');
        return;
      }

      setIsUploadingAvatar(true);

      const uploadResult = await userService.uploadAvatar(asset.uri);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload avatar.');
      }

      const nextAvatar = uploadResult.data.avatarUrl;
      updateUser({ avatar: nextAvatar, updatedAt: new Date() });

      if (user?.id) {
        syncAuthorAvatar(String(user.id), nextAvatar);
      }

      Alert.alert('Avatar updated', 'Your profile photo has been refreshed.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error occurred.';
      Alert.alert('Upload failed', message);
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [isUploadingAvatar, updateUser, user?.id, syncAuthorAvatar]);

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
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
              Alert.alert('Logged out', 'You have been logged out');
            } catch (err) {
              console.error('Logout failed', err);
              Alert.alert('Logout failed', (err instanceof Error) ? err.message : 'Unknown error');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => Alert.alert('Edit Profile', 'Update user info feature coming soon');
  const handleSecurity = useCallback(() => {
    router.push('/security-privacy');
  }, [router]);
  const handleSettings = useCallback(() => {
    router.push('/app-settings');
  }, [router]);
  const handleHelp = () => Alert.alert('Help', 'Help & support placeholder');
  const handleDebug = useCallback(() => {
    router.push('/debug-tools');
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

          <ThemedText style={styles.userName}>{user?.name ?? 'Guest User'}</ThemedText>

          {/* Info Section */}
          <View style={styles.infoSection}>
            {user?.phoneNumber && (
              <View style={styles.infoRow}>
                <Ionicons name="phone-portrait" size={16} color={colors.accent} />
                <ThemedText style={styles.infoLabel}>Phone</ThemedText>
                <ThemedText style={styles.infoValue}>{user.phoneNumber}</ThemedText>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              </View>
            )}

            {user?.email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={16} color={colors.accent} />
                <ThemedText style={styles.infoLabel}>Email</ThemedText>
                <ThemedText style={styles.infoValue}>{user.email}</ThemedText>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              </View>
            )}

            {user?.createdAt && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={16} color={colors.accent} />
                <ThemedText style={styles.infoLabel}>Joined</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <ThemedText style={styles.statusText}>Account Active</ThemedText>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="shield-checkmark"
              label="Security & Privacy"
              onPress={handleSecurity}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="settings"
              label="App Settings"
              onPress={handleSettings}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="help-circle"
              label="Help & Support"
              onPress={handleHelp}
            />
          </View>
        </View>

        {/* Debug Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Debug</ThemedText>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="code-working"
              label="Debug Tools"
              onPress={handleDebug}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="log-out"
              label="Log out"
              onPress={handleLogout}
              isDanger={true}
            />
          </View>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>Haritage v1.0.0</ThemedText>
          <ThemedText style={styles.footerSubtext}>© 2025 All rights reserved</ThemedText>
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
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    profileCard: {
      marginHorizontal: 16,
      marginVertical: 16,
      paddingVertical: 24,
      paddingHorizontal: 16,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    editButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    avatarContainer: {
      marginBottom: 16,
      position: 'relative',
    },
    avatarWrapper: {
      position: 'relative',
      width: 88,
      height: 88,
    },
    avatarImage: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 3,
      borderColor: colors.accent,
    },
    avatarPlaceholder: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.backgroundMuted,
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
      borderRadius: 44,
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
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.accent,
      borderWidth: 2,
      borderColor: colors.surfaceSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 3,
      elevation: 4,
    },
    cameraBadgeDisabled: {
      backgroundColor: colors.surfaceTertiary,
      shadowOpacity: 0,
    },
    userName: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    infoSection: {
      width: '100%',
      marginBottom: 16,
      gap: 8,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    infoLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      width: 60,
    },
    infoValue: {
      fontSize: 13,
      color: colors.text,
      flex: 1,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.successSoft,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.success,
      gap: 6,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.success,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.success,
    },
    section: {
      marginHorizontal: 16,
      marginVertical: 16,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    menuContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    menuLabel: {
      fontSize: 16,
      fontWeight: '500',
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
      paddingVertical: 24,
      paddingHorizontal: 16,
      gap: 4,
    },
    footerText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
    footerSubtext: {
      fontSize: 12,
      color: colors.iconMuted,
    },
  });
