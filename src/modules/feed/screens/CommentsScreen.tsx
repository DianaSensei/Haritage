import { useCommentStore } from '@/core/store';
import { mockStore } from '@/shared/data/stores/mockDataStore';
import { useAppTheme } from '@/shared/hooks';
import { Comment } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  type ListRenderItemInfo,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommentInput } from '../components/CommentInput';
import { CommentItem } from '../components/CommentItem';

const EMPTY_COMMENTS: Comment[] = [];

type ReplyTarget = {
  commentId: string;
  parentId: string;
  authorName: string;
};

interface CommentsScreenProps {
  visible: boolean;
  postId: string;
  onClose: () => void;
}

export const CommentsScreen: React.FC<CommentsScreenProps> = ({
  visible,
  postId,
  onClose,
}) => {
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const selectPostComments = useMemo(
    () =>
      (state: { commentsByPost: Record<string, Comment[]> }) =>
        postId ? state.commentsByPost[postId] ?? EMPTY_COMMENTS : EMPTY_COMMENTS,
    [postId],
  );
  const postComments = useCommentStore(selectPostComments);
  const setComments = useCommentStore((state) => state.setComments);
  const addCommentToStore = useCommentStore((state) => state.addComment);
  const updateCommentInStore = useCommentStore((state) => state.updateComment);
  const comments = useMemo(
    () => postComments.filter((comment) => !comment.parentCommentId),
    [postComments],
  );
  const commentLookup = useMemo(() => {
    const map = new Map<string, Comment>();
    postComments.forEach((comment) => {
      map.set(comment.id, comment);
    });
    return map;
  }, [postComments]);
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const iconMuted = colors.iconMuted;
  // Offset ensures the modal header stays visible when the keyboard appears.
  const keyboardVerticalOffset = useMemo(
    () => (Platform.OS === 'ios' ? insets.top + 64 : 0),
    [insets.top],
  );

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const mockComments = mockStore.getCommentsForPost(postId);
      setComments(postId, mockComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, setComments]);

  // Load comments when modal opens
  useEffect(() => {
    if (visible && postId) {
      loadComments();
    }
  }, [visible, postId, loadComments]);

  const handleAddComment = (text: string) => {
    const currentUser = mockStore.getCurrentUser();
    if (!currentUser) return;
    const parentCommentId = replyTarget?.parentId;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      parentCommentId,
      author: {
        id: currentUser.id,
        name: currentUser.name || 'Anonymous',
        avatar: currentUser.avatar || '',
      },
      content: text,
      upvotes: 0,
      downvotes: 0,
      isUpvoted: false,
      isDownvoted: false,
      replyCount: 0,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to store
    addCommentToStore(newComment);
    mockStore.addComment(newComment);
    
    // Update reply count if this is a reply
    if (parentCommentId) {
      const parentComment = mockStore.getCommentById(parentCommentId);
      if (parentComment) {
        const updatedReplyCount = (parentComment.replyCount || 0) + 1;
        updateCommentInStore(parentCommentId, { replyCount: updatedReplyCount });
        mockStore.updateComment(parentCommentId, { replyCount: updatedReplyCount });
      }
      setReplyTarget(null);
    }

    // Save to persistent storage
    mockStore.save().catch((error) => {
      console.error('Error saving comment:', error);
    });
  };

  useEffect(() => {
    if (!visible && replyTarget) {
      setReplyTarget(null);
    }
  }, [visible, replyTarget]);

  const resolveParentCommentId = useCallback(
    (comment: Comment) => {
      if (!comment.parentCommentId) {
        return comment.id;
      }

      let currentParentId: string | undefined = comment.parentCommentId;
      let currentParent = currentParentId
        ? commentLookup.get(currentParentId)
        : undefined;

      while (currentParent?.parentCommentId) {
        currentParentId = currentParent.parentCommentId;
        currentParent = currentParentId
          ? commentLookup.get(currentParentId)
          : undefined;
      }

      return currentParentId ?? comment.parentCommentId ?? comment.id;
    },
    [commentLookup],
  );

  const handleReply = useCallback(
    (comment: Comment) => {
      const parentId = resolveParentCommentId(comment);
      setReplyTarget({
        commentId: comment.id,
        parentId,
        authorName: comment.author.name,
      });
    },
    [resolveParentCommentId],
  );

  const getReplyingToAuthor = () => replyTarget?.authorName ?? null;

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Comments ({comments.length})</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={24} color={colors.icon} />
      </TouchableOpacity>
    </View>
  );

  const listEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubble-outline" size={48} color={iconMuted} />
        <Text style={styles.emptyText}>No comments yet</Text>
        <Text style={styles.emptySubtext}>Be the first to share your thoughts</Text>
      </View>
    ),
    [iconMuted, styles],
  );

  const renderCommentInputHeader = () => {
    if (!replyTarget) return null;

    const authorName = getReplyingToAuthor();
    return (
      <View style={styles.replyingToHeader}>
        <Text style={styles.replyingToText}>Replying to {authorName}</Text>
        <TouchableOpacity onPress={() => setReplyTarget(null)}>
          <Ionicons name="close-circle" size={18} color={iconMuted} />
        </TouchableOpacity>
      </View>
    );
  };

  const keyExtractor = useCallback((item: Comment) => item.id, []);

  const renderCommentItem = useCallback(
    ({ item }: ListRenderItemInfo<Comment>) => (
      <CommentItem comment={item} onReply={handleReply} />
    ),
    [handleReply],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {renderHeader()}
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <KeyboardAvoidingView
            style={styles.content}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={keyboardVerticalOffset}
          >
            <FlatList
              style={styles.list}
              data={comments}
              keyExtractor={keyExtractor}
              renderItem={renderCommentItem}
              contentContainerStyle={[
                styles.listContent,
                comments.length === 0 && styles.listContentEmpty,
              ]}
              ListEmptyComponent={listEmptyComponent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={12}
              maxToRenderPerBatch={12}
              windowSize={9}
              removeClippedSubviews
              keyboardShouldPersistTaps="handled"
            />
            
            <View style={styles.inputContainer}>
              {renderCommentInputHeader()}
              <CommentInput
                placeholder={
                  replyTarget
                    ? `Reply to ${getReplyingToAuthor()}...`
                    : 'Add a comment...'
                }
                onSubmit={handleAddComment}
                autoFocus={false}
              />
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const createStyles = (
  colors: ReturnType<typeof useAppTheme>['colors'],
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    listContentEmpty: {
      flexGrow: 1,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 48,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginTop: 12,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 4,
      textAlign: 'center',
    },
    inputContainer: {
      backgroundColor: colors.surfaceSecondary,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    replyingToHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    replyingToText: {
      fontSize: 12,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
  });
