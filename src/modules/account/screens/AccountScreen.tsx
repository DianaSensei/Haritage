import { useAuth } from '@/modules/auth/hooks/useAuth';
import { userService } from '@/modules/account/services/userService';
import { IconSymbol, ThemedText, ThemedView } from '@/shared/components';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const AccountScreen: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon'); // using icon as border color for subtle theme sync
  const accentColor = useThemeColor({}, 'tint');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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
              // give feedback in console for debugging
              console.log('Logging out...');
              await logout();
              console.log('Logged out - store cleared');
              // ensure app navigates back to auth screen immediately
              try {
                router.replace('/');
              } catch (e) {
                // ignore router errors, still show logged out message
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

  const handleSecurity = () => Alert.alert('Security', 'Security settings placeholder');
  const handleSettings = () => Alert.alert('Settings', 'App settings placeholder');
  const handleHelp = () => Alert.alert('Help', 'Help & support placeholder');

  const handleEditProfile = () => Alert.alert('Edit Profile', 'Update user info feature coming soon');

  const handleChangeAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow photo library access to change your avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) return;

      setIsUploadingAvatar(true);

      // Upload avatar
      const uploadResult = await userService.uploadAvatar({
        uri: asset.uri,
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      });

      if (uploadResult.success && uploadResult.data.avatarUrl) {
        // Update user state with new avatar URL
        updateUser({ avatar: uploadResult.data.avatarUrl });
        Alert.alert('Success', 'Avatar updated successfully');
      } else {
        Alert.alert('Error', uploadResult.error || 'Failed to upload avatar');
      }
    } catch (error: any) {
      console.error('Avatar change error:', error);
      Alert.alert('Error', error?.message || 'Failed to change avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={[styles.userInfoBlock, { backgroundColor, borderColor: borderColor + '40' }]}>
          <View style={[styles.accent, { backgroundColor: accentColor + '22' }]} />
          <TouchableOpacity style={styles.editIcon} onPress={handleEditProfile}>
            <IconSymbol name="settings" size={20} color={tintColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.avatarContainer} onPress={handleChangeAvatar} activeOpacity={0.8}>
            {isUploadingAvatar ? (
              <View style={styles.avatarLoading}>
                <ActivityIndicator size="large" color={tintColor} />
              </View>
            ) : user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <IconSymbol name="person.crop.circle" size={80} color={tintColor} />
            )}
            {!isUploadingAvatar && (
              <View style={[styles.avatarBadge, { backgroundColor: tintColor }]}>
                <IconSymbol name="camera" size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <ThemedText type="title" style={[styles.name, { color: textColor }]}>{user?.name ?? 'Guest'}</ThemedText>

          <View style={styles.infoRow}>
            <IconSymbol name="phone" size={18} color={tintColor} />
            <ThemedText style={[styles.infoText, { color: textColor }]}>{user?.phoneNumber ?? 'Not provided'}</ThemedText>
            {user?.phoneNumber && (
              <IconSymbol name="security" size={16} color="green" style={styles.verifyIconRight} />
            )}
          </View>

          <View style={styles.infoRow}>
            <IconSymbol name="mail" size={16} color={tintColor} />
            <ThemedText style={[styles.infoText, { color: textColor }]}>{user?.email ?? 'Not provided'}</ThemedText>
            {user?.email && (
              <IconSymbol name="security" size={16} color="green" style={styles.verifyIconRight} />
            )}
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionItem} onPress={handleSecurity}>
            <IconSymbol name="security" size={24} color={tintColor} />
            <ThemedText style={styles.actionText}>Security</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleSettings}>
            <IconSymbol name="settings" size={24} color={tintColor} />
            <ThemedText style={styles.actionText}>Settings</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleHelp}>
            <IconSymbol name="help.circle" size={24} color={tintColor} />
            <ThemedText style={styles.actionText}>Help</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
            <IconSymbol name="exit" size={24} color={tintColor} />
            <ThemedText style={styles.actionText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  userInfoBlock: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // for Android
    marginBottom: 24,
    position: 'relative',
  },
  avatarContainer: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 44,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  avatarImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3,
    borderColor: '#fff',
  },
  accent: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 48,
    height: 28,
    borderRadius: 14,
    opacity: 0.12,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarLoading: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  phoneText: {
    marginLeft: 8,
    fontSize: 16,
  },
  centerRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  emailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  editIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  firstLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    textAlign: 'center',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  verifyIconRight: {
    marginLeft: 8,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '80%',
    justifyContent: 'flex-start',
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
  },
});
