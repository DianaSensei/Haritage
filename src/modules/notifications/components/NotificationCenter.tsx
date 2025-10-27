 
import { useNotificationStore } from '@/core/store/slices/notificationSlice';
import { Notification } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface NotificationCenterProps {
  isVisible: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isVisible,
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotificationStore();

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // Handle navigation to action URL
      Alert.alert('Action', `Navigate to: ${notification.actionUrl}`);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAllNotifications },
      ]
    );
  };

  const handleRemoveNotification = (id: string) => {
    removeNotification(id);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'information-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'alert-circle';
      case 'success':
        return 'checkmark-circle';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return '#007AFF';
      case 'warning':
        return '#FF9500';
      case 'error':
        return '#FF3B30';
      case 'success':
        return '#34C759';
      default:
        return '#666';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
      onLongPress={() => setSelectedNotification(item)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Ionicons
            name={getNotificationIcon(item.type)}
            size={20}
            color={getNotificationColor(item.type)}
            style={styles.notificationIcon}
          />
          <View style={styles.notificationTextContainer}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
          </View>
          <Text style={styles.notificationTime}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-off" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No notifications</Text>
      <Text style={styles.emptyStateMessage}>
        You're all caught up! New notifications will appear here.
      </Text>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            {notifications.length > 0 && (
              <>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleMarkAllAsRead}
                >
                  <Ionicons name="checkmark-done" size={24} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleClearAll}
                >
                  <Ionicons name="trash" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          ListEmptyComponent={renderEmptyState}
          style={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        />

        {/* Action Sheet for selected notification */}
        {selectedNotification && (
          <View style={styles.actionSheetOverlay}>
            <View style={styles.actionSheet}>
              <Text style={styles.actionSheetTitle}>Notification Actions</Text>
              <TouchableOpacity
                style={styles.actionSheetButton}
                onPress={() => {
                  handleNotificationPress(selectedNotification);
                  setSelectedNotification(null);
                }}
              >
                <Ionicons name="eye" size={20} color="#007AFF" />
                <Text style={styles.actionSheetButtonText}>
                  {selectedNotification.isRead ? 'View' : 'Mark as Read'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionSheetButton}
                onPress={() => {
                  handleRemoveNotification(selectedNotification.id);
                  setSelectedNotification(null);
                }}
              >
                <Ionicons name="trash" size={20} color="#FF3B30" />
                <Text style={[styles.actionSheetButtonText, { color: '#FF3B30' }]}>
                  Remove
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionSheetButton}
                onPress={() => setSelectedNotification(null)}
              >
                <Text style={styles.actionSheetButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 10,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  unreadNotification: {
    backgroundColor: '#f8f9ff',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 10,
    marginTop: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionSheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  actionSheetButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
});
