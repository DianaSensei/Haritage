/**
 * ManageableFeedItem Component
 * Wrapper around FeedItem that adds management actions (edit, hide, delete)
 * for the user's own posts
 */

import { FeedItem as FeedItemType } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ConfirmDialog } from './ConfirmDialog';
import { FeedActionMenu, FeedAction } from './FeedActionMenu';
import { FeedItem } from './FeedItem';

interface ManageableFeedItemProps {
  item: FeedItemType;
  isActive: boolean;
  currentUserId: string;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onMediaPress?: (postId: string, mediaIndex: number) => void;
  onVideoEnd?: (id: string) => void;
  onEdit?: (id: string) => void;
  onHide?: (id: string) => void;
  onUnhide?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ManageableFeedItem: React.FC<ManageableFeedItemProps> = ({
  item,
  isActive,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onMediaPress,
  onVideoEnd,
  onEdit,
  onHide,
  onUnhide,
  onDelete,
}) => {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHideDialog, setShowHideDialog] = useState(false);

  const isOwnPost = item.author.id === currentUserId;

  const actions: FeedAction[] = [
    {
      id: 'edit',
      label: 'Edit Post',
      icon: 'create-outline',
      color: '#0a66c2',
    },
    item.isHidden
      ? {
          id: 'unhide',
          label: 'Unhide Post',
          icon: 'eye-outline',
          color: '#27ae60',
        }
      : {
          id: 'hide',
          label: 'Hide Post',
          icon: 'eye-off-outline',
          color: '#f39c12',
        },
    {
      id: 'delete',
      label: 'Delete Post',
      icon: 'trash-outline',
      color: '#e74c3c',
      destructive: true,
    },
  ];

  const handleActionPress = (actionId: string) => {
    switch (actionId) {
      case 'edit':
        onEdit?.(item.id);
        break;
      case 'hide':
        setShowHideDialog(true);
        break;
      case 'unhide':
        onUnhide?.(item.id);
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
    }
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    onDelete?.(item.id);
  };

  const handleConfirmHide = () => {
    setShowHideDialog(false);
    onHide?.(item.id);
  };

  if (!isOwnPost) {
    return (
      <FeedItem
        item={item}
        isActive={isActive}
        onLike={onLike}
        onComment={onComment}
        onShare={onShare}
        onMediaPress={onMediaPress}
        onVideoEnd={onVideoEnd}
      />
    );
  }

  return (
    <>
      <View style={styles.container}>
        <FeedItem
          item={item}
          isActive={isActive}
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
          onMediaPress={onMediaPress}
          onVideoEnd={onVideoEnd}
        />

        {/* Management Actions Button */}
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => setShowActionMenu(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-outline" size={20} color="#0a66c2" />
        </TouchableOpacity>

        {item.isHidden && (
          <View style={styles.hiddenBadge}>
            <Ionicons name="eye-off" size={14} color="#f39c12" />
          </View>
        )}
      </View>

      <FeedActionMenu
        visible={showActionMenu}
        actions={actions}
        onActionPress={handleActionPress}
        onClose={() => setShowActionMenu(false)}
      />

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Post?"
        message="This action cannot be undone. Your post will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="#e74c3c"
        icon="trash-outline"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      <ConfirmDialog
        visible={showHideDialog}
        title="Hide Post?"
        message="This post will be hidden from the public feed. You can unhide it later from your posts."
        confirmText="Hide"
        cancelText="Cancel"
        confirmColor="#f39c12"
        icon="eye-off-outline"
        onConfirm={handleConfirmHide}
        onCancel={() => setShowHideDialog(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  manageButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(39, 39, 41, 0.9)',
    borderWidth: 1,
    borderColor: '#0a66c2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  hiddenBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    borderWidth: 1,
    borderColor: '#f39c12',
  },
});
