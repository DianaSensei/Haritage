import { useCommentStore } from '@/core/store';
import { mockStore } from '@/shared/data/stores/mockDataStore';
import { Comment } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CommentInput } from '../components/CommentInput';
import { CommentItem } from '../components/CommentItem';

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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const commentStore = useCommentStore();
  const comments = commentStore.getCommentsForPost(postId);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const mockComments = mockStore.getCommentsForPost(postId);
      commentStore.setComments(postId, mockComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [commentStore, postId]);

  // Load comments when modal opens
  useEffect(() => {
    if (visible && postId) {
      loadComments();
    }
  }, [visible, postId, loadComments]);

  const handleAddComment = (text: string) => {
    const currentUser = mockStore.getCurrentUser();
    if (!currentUser) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      parentCommentId: replyingTo || undefined,
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
    commentStore.addComment(newComment);
    mockStore.addComment(newComment);
    
    // Update reply count if this is a reply
    if (replyingTo) {
      const parentComment = mockStore.getCommentById(replyingTo);
      if (parentComment) {
        const updatedReplyCount = (parentComment.replyCount || 0) + 1;
        commentStore.updateComment(replyingTo, { replyCount: updatedReplyCount });
        mockStore.updateComment(replyingTo, { replyCount: updatedReplyCount });
      }
      setReplyingTo(null);
    }

    // Save to persistent storage
    mockStore.save().catch((error) => {
      console.error('Error saving comment:', error);
    });
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
  };

  const getReplyingToAuthor = () => {
    if (!replyingTo) return null;
    const comment = comments.find((c) => c.id === replyingTo);
    return comment?.author.name;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Comments ({comments.length})</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color="#e4e6eb" />
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-outline" size={48} color="#4a4a4a" />
      <Text style={styles.emptyText}>No comments yet</Text>
      <Text style={styles.emptySubtext}>Be the first to share your thoughts</Text>
    </View>
  );

  const renderCommentInputHeader = () => {
    if (!replyingTo) return null;

    const authorName = getReplyingToAuthor();
    return (
      <View style={styles.replyingToHeader}>
        <Text style={styles.replyingToText}>Replying to {authorName}</Text>
        <TouchableOpacity onPress={() => setReplyingTo(null)}>
          <Ionicons name="close-circle" size={18} color="#8c919d" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a66c2" />
          </View>
        ) : (
          <>
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CommentItem comment={item} onReply={handleReply} />
              )}
              contentContainerStyle={[
                styles.listContent,
                comments.length === 0 && styles.listContentEmpty,
              ]}
              ListEmptyComponent={renderEmpty}
              showsVerticalScrollIndicator={false}
            />
            
            <View style={styles.inputContainer}>
              {renderCommentInputHeader()}
              <CommentInput
                placeholder={
                  replyingTo
                    ? `Reply to ${getReplyingToAuthor()}...`
                    : 'Add a comment...'
                }
                onSubmit={handleAddComment}
                autoFocus={false}
              />
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#272729',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#343536',
    backgroundColor: '#1f1f20',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e4e6eb',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listContentEmpty: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8c919d',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#4a4a4a',
  },
  inputContainer: {
    backgroundColor: '#272729',
  },
  replyingToHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1f1f20',
    borderTopWidth: 1,
    borderTopColor: '#343536',
  },
  replyingToText: {
    fontSize: 12,
    color: '#8c919d',
    fontStyle: 'italic',
  },
});
