/**
 * FeedActionMenu Component
 * Bottom sheet menu for feed item actions (edit, hide, delete)
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface FeedAction {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  destructive?: boolean;
}

interface FeedActionMenuProps {
  visible: boolean;
  actions: FeedAction[];
  onActionPress: (actionId: string) => void;
  onClose: () => void;
}

export const FeedActionMenu: React.FC<FeedActionMenuProps> = ({
  visible,
  actions,
  onActionPress,
  onClose,
}) => {
  const handleActionPress = (actionId: string) => {
    onActionPress(actionId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.menuContainer}>
          <View style={styles.handle} />
          
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {actions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionItem,
                  index === 0 && styles.firstActionItem,
                  index === actions.length - 1 && styles.lastActionItem,
                ]}
                onPress={() => handleActionPress(action.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={action.icon}
                  size={22}
                  color={action.color || '#e4e6eb'}
                />
                <Text
                  style={[
                    styles.actionText,
                    action.destructive && styles.destructiveText,
                    action.color && { color: action.color },
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#272729',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#3a3b3c',
    paddingBottom: 34,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#4a4b4c',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1f1f20',
    borderColor: '#343536',
    borderTopWidth: 1,
    gap: 16,
  },
  firstActionItem: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastActionItem: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 1,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#e4e6eb',
    flex: 1,
  },
  destructiveText: {
    color: '#e74c3c',
  },
  cancelButton: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    backgroundColor: '#3a3b3c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4a4b4c',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e4e6eb',
  },
});
