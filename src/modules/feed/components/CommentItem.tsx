import { useCommentStore } from '@/core/store';
import { Comment } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CommentItemProps {
  comment: Comment;
  onReply?: (comment: Comment) => void;
  depth?: number;
}

const MAX_REPLY_DEPTH = 2;

const CommentItemComponent: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  depth = 0,
}) => {
  const [voteState, setVoteState] = useState<'upvote' | 'downvote' | 'none'>(() => {
    if (comment.isDownvoted) return 'downvote';
    if (comment.isUpvoted) return 'upvote';
    return 'none';
  });
  const [upvotes, setUpvotes] = useState(comment.upvotes);
  const [downvotes, setDownvotes] = useState(comment.downvotes);
  const [showReplies, setShowReplies] = useState(false);
  
  const updateComment = useCommentStore((state) => state.updateComment);
  const getRepliesForComment = useCommentStore((state) => state.getRepliesForComment);
  
  const replies = getRepliesForComment(comment.postId, comment.id);
  const canReply = depth < MAX_REPLY_DEPTH;
  const hasAvatar = Boolean(comment.author.avatar);
  const avatarIconSize = depth > 0 ? 20 : 24;
  const isNested = depth > 0;
  const { t, i18n } = useTranslation();
  const numberLocale = useMemo(() => (i18n.language === 'vi' ? 'vi-VN' : 'en-US'), [i18n.language]);

  const applyVote = (nextState: 'upvote' | 'downvote' | 'none') => {
    let updatedUpvotes = upvotes;
    let updatedDownvotes = downvotes;

    if (voteState === 'upvote') {
      updatedUpvotes = Math.max(0, updatedUpvotes - 1);
    } else if (voteState === 'downvote') {
      updatedDownvotes = Math.max(0, updatedDownvotes - 1);
    }

    if (nextState === 'upvote') {
      updatedUpvotes += 1;
    } else if (nextState === 'downvote') {
      updatedDownvotes += 1;
    }

    setVoteState(nextState);
    setUpvotes(updatedUpvotes);
    setDownvotes(updatedDownvotes);

    updateComment(comment.id, {
      upvotes: updatedUpvotes,
      downvotes: updatedDownvotes,
      isUpvoted: nextState === 'upvote',
      isDownvoted: nextState === 'downvote',
    });
  };

  const handleToggleUpvote = () => {
    const nextState = voteState === 'upvote' ? 'none' : 'upvote';
    applyVote(nextState);
  };

  const handleToggleDownvote = () => {
    const nextState = voteState === 'downvote' ? 'none' : 'downvote';
    applyVote(nextState);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t('commentItem.justNow');
    }

    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t('commentItem.minuteAgo', { count: minutes });
    }

    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t('commentItem.hourAgo', { count: hours });
    }

    const days = Math.floor(diffInSeconds / 86400);
    return t('commentItem.dayAgo', { count: days });
  };

  const handleReply = () => {
    if (canReply && onReply) {
      onReply(comment);
    }
  };

  const toggleReplies = () => {
    setShowReplies((prev) => !prev);
  };

  return (
    <View style={[styles.container, isNested && styles.nestedContainer]}>
      <View style={styles.commentContent}>
        {hasAvatar ? (
          <Image
            source={{ uri: comment.author.avatar }}
            style={[styles.avatar, isNested && styles.smallAvatar]}
          />
        ) : (
          <View
            style={[styles.avatar, isNested && styles.smallAvatar, styles.avatarFallback]}
          >
            <Ionicons name="person-circle-outline" size={avatarIconSize} color="#8c919d" />
          </View>
        )}
        <View style={styles.commentBody}>
          <View style={styles.header}>
            <Text style={styles.authorName}>
              {comment.author.name || t('comments.anonymous')}
            </Text>
            <Text style={styles.timestamp}>{formatTimeAgo(comment.createdAt)}</Text>
          </View>
          
          <Text
            style={[
              styles.commentText,
              comment.isDeleted && styles.deletedText,
            ]}
          >
            {comment.content}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleToggleUpvote}
              style={[styles.voteButton, voteState === 'upvote' && styles.voteButtonActive]}
            >
              <Ionicons
                name={voteState === 'upvote' ? 'arrow-up' : 'arrow-up-outline'}
                size={16}
                color={voteState === 'upvote' ? '#f4f5f7' : '#8c919d'}
              />
              <Text
                style={[
                  styles.voteCount,
                  voteState === 'upvote' && styles.voteCountActive,
                ]}
              >
                {upvotes.toLocaleString(numberLocale)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleToggleDownvote}
              style={[
                styles.voteButton,
                voteState === 'downvote' && styles.voteButtonDanger,
              ]}
            >
              <Ionicons
                name={voteState === 'downvote' ? 'arrow-down' : 'arrow-down-outline'}
                size={16}
                color={voteState === 'downvote' ? '#ff4d4f' : '#8c919d'}
              />
              <Text
                style={[
                  styles.voteCount,
                  voteState === 'downvote' && styles.voteCountDanger,
                ]}
              >
                {downvotes.toLocaleString(numberLocale)}
              </Text>
            </TouchableOpacity>

            {canReply && !comment.isDeleted && (
              <TouchableOpacity onPress={handleReply} style={styles.replyButton}>
                <Ionicons name="return-down-forward-outline" size={14} color="#8c919d" />
                <Text style={styles.replyText}>{t('commentItem.reply')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {replies.length > 0 && (
        <View style={styles.repliesSection}>
          <TouchableOpacity onPress={toggleReplies} style={styles.showRepliesButton}>
            <Ionicons
              name={showReplies ? 'chevron-up' : 'chevron-down'}
              size={14}
              color="#8c919d"
            />
            <Text style={styles.showRepliesText}>
              {showReplies
                ? t('commentItem.hideReplies', { count: replies.length })
                : t('commentItem.showReplies', { count: replies.length })}
            </Text>
          </TouchableOpacity>

          {showReplies &&
            replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                depth={depth + 1}
              />
            ))}
        </View>
      )}
    </View>
  );
};

const areEqual = (prev: CommentItemProps, next: CommentItemProps) => {
  return (
    prev.comment.id === next.comment.id &&
    prev.comment.upvotes === next.comment.upvotes &&
    prev.comment.downvotes === next.comment.downvotes &&
    prev.comment.isUpvoted === next.comment.isUpvoted &&
    prev.comment.isDownvoted === next.comment.isDownvoted &&
    prev.comment.replyCount === next.comment.replyCount &&
    prev.comment.content === next.comment.content &&
    prev.depth === next.depth
  );
};

export const CommentItem = memo(CommentItemComponent, areEqual);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  nestedContainer: {
    marginLeft: 24,
    borderLeftWidth: 2,
    borderLeftColor: '#343536',
    paddingLeft: 12,
  },
  commentContent: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#343536',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f1f20',
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  commentBody: {
    flex: 1,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e4e6eb',
  },
  timestamp: {
    fontSize: 11,
    color: '#818384',
  },
  commentText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#e4e6eb',
  },
  deletedText: {
    fontStyle: 'italic',
    color: '#818384',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16181f',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  voteButtonActive: {
    backgroundColor: '#2536b8',
  },
  voteButtonDanger: {
    backgroundColor: '#30171a',
  },
  voteCount: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8c919d',
  },
  voteCountActive: {
    color: '#f4f5f7',
  },
  voteCountDanger: {
    color: '#ff4d4f',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  replyText: {
    fontSize: 12,
    color: '#8c919d',
    fontWeight: '500',
  },
  repliesSection: {
    marginTop: 8,
  },
  showRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginLeft: 48,
  },
  showRepliesText: {
    fontSize: 12,
    color: '#8c919d',
    fontWeight: '500',
  },
});
