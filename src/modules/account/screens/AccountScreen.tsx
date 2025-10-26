import { useAuth } from '@/modules/auth/hooks/useAuth';
import { ThemedText } from '@/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  isDanger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress, isDanger }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <Ionicons
        name={icon as any}
        size={20}
        color={isDanger ? '#FF3B30' : '#0a66c2'}
      />
      <ThemedText style={[styles.menuLabel, isDanger && styles.menuLabelDanger]}>
        {label}
      </ThemedText>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#818384" />
  </TouchableOpacity>
);

export const AccountScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

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
  const handleSecurity = () => Alert.alert('Security', 'Security settings placeholder');
  const handleSettings = () => Alert.alert('Settings', 'App settings placeholder');
  const handleHelp = () => Alert.alert('Help', 'Help & support placeholder');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Account</ThemedText>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleEditProfile}
            activeOpacity={0.8}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#0a66c2" />
              </View>
            )}
          </TouchableOpacity>

          <ThemedText style={styles.userName}>{user?.name ?? 'Guest User'}</ThemedText>

          {/* Info Section */}
          <View style={styles.infoSection}>
            {user?.phoneNumber && (
              <View style={styles.infoRow}>
                <Ionicons name="phone-portrait" size={16} color="#0a66c2" />
                <ThemedText style={styles.infoLabel}>Phone</ThemedText>
                <ThemedText style={styles.infoValue}>{user.phoneNumber}</ThemedText>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              </View>
            )}

            {user?.email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={16} color="#0a66c2" />
                <ThemedText style={styles.infoLabel}>Email</ThemedText>
                <ThemedText style={styles.infoValue}>{user.email}</ThemedText>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              </View>
            )}

            {user?.createdAt && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={16} color="#0a66c2" />
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1b',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#1a1a1b',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#343536',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e4e6eb',
  },
  profileCard: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#272729',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#404142',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    backgroundColor: '#0a66c2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0a66c2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#0a66c2',
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1a1a1b',
    borderWidth: 2,
    borderColor: '#0a66c2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e4e6eb',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoSection: {
    width: '100%',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#1a1a1b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#343536',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#818384',
    marginLeft: 8,
    width: 50,
  },
  infoValue: {
    fontSize: 13,
    color: '#e4e6eb',
    flex: 1,
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
    marginLeft: 6,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#818384',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuContainer: {
    backgroundColor: '#272729',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#404142',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e4e6eb',
    marginLeft: 12,
  },
  menuLabelDanger: {
    color: '#FF3B30',
  },
  divider: {
    height: 1,
    backgroundColor: '#343536',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#818384',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666',
  },
});
