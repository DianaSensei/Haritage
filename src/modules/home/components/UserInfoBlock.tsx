import { CONFIG } from '@/core/config';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const UserInfoBlock: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    console.log("logout");
    logout();
  };

  const handleEditProfile = () => {
    // Navigate to profile edit screen
    console.log('Navigate to profile edit');
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Image
          source={user.avatar ? { uri: user.avatar } : CONFIG.ASSETS.DEFAULT_AVATAR}
          style={styles.avatar}
        />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>
            {user.name || 'User'}
          </Text>
          <Text style={styles.userPhone}>
            {user.phoneNumber}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEditProfile}
        >
          <Ionicons name="create-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 10,
    marginLeft: 10,
  },
});
