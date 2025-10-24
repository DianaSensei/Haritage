import { mediaService } from '@/modules/feed/services/mediaService';
import { IconSymbol } from '@/shared/components';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface AvatarUploaderProps {
  currentAvatarUrl?: string;
  onUploadSuccess: (avatarUrl: string) => void;
  size?: number;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatarUrl,
  onUploadSuccess,
  size = 82,
}) => {
  const [uploading, setUploading] = useState(false);
  const tintColor = useThemeColor({}, 'tint');

  const pickAndUploadImage = async () => {
    try {
      // Request permissions
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissions required', 'Please allow photo library access to change your avatar.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) return;

      setUploading(true);

      // Prepare file for upload
      const fileUpload = {
        uri: asset.uri,
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      };

      // Upload image using mediaService
      const uploadResult = await mediaService.uploadImage(fileUpload, 'avatar');

      // Call success callback with the uploaded URL
      onUploadSuccess(uploadResult.url);

      Alert.alert('Success', 'Avatar updated successfully!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Upload failed', error instanceof Error ? error.message : 'Unable to upload avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: size + 6, height: size + 6 }]}
      onPress={pickAndUploadImage}
      disabled={uploading}
      activeOpacity={0.8}
    >
      {currentAvatarUrl ? (
        <Image
          source={{ uri: currentAvatarUrl }}
          style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View style={[styles.placeholderContainer, { width: size, height: size, borderRadius: size / 2 }]}>
          <IconSymbol name="person.crop.circle" size={size} color={tintColor} />
        </View>
      )}

      {uploading && (
        <View style={[styles.loadingOverlay, { width: size, height: size, borderRadius: size / 2 }]}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      )}

      {!uploading && (
        <View style={styles.editBadge}>
          <IconSymbol name="camera" size={16} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  avatarImage: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  placeholderContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
