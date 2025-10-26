import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface ReactionBarProps {
  likes: number;
  downvotes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isDownvoted: boolean;
  isSaved: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  onToggleLike: () => void;
  onToggleDownvote: () => void;
  onComment: () => void;
  onShare: () => void;
  onToggleSave: () => void;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({
  likes,
  downvotes,
  comments,
  shares,
  isLiked,
  isDownvoted,
  isSaved,
  disabled = false,
  style,
  onToggleLike,
  onToggleDownvote,
  onComment,
  onShare,
  onToggleSave,
}) => {
  const pointerEvents = disabled ? 'none' : 'auto';
  const opacity = disabled ? 0.6 : 1;

  return (
    <View style={[styles.bar, style, { opacity }]} pointerEvents={pointerEvents}>
      <View style={styles.group}>
        <TouchableOpacity
          onPress={onToggleLike}
          style={[styles.button, isLiked && styles.buttonActive]}
        >
          <Ionicons
            name={isLiked ? 'arrow-up' : 'arrow-up-outline'}
            size={18}
            color={isLiked ? '#f4f5f7' : '#8c919d'}
          />
          <Text style={[styles.count, isLiked && styles.countActive]}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onToggleDownvote}
          style={[styles.button, isDownvoted && styles.buttonDangerActive]}
        >
          <Ionicons
            name={isDownvoted ? 'arrow-down' : 'arrow-down-outline'}
            size={18}
            color={isDownvoted ? '#ff4d4f' : '#8c919d'}
          />
          <Text style={[styles.count, isDownvoted && styles.countDanger]}>{downvotes}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.group}>
        <TouchableOpacity onPress={onComment} style={[styles.button, styles.buttonCompact]}>
          <Ionicons name="chatbubble-outline" size={18} color="#8c919d" />
          <Text style={styles.count}>{comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onShare} style={[styles.button, styles.buttonCompact]}>
          <Ionicons name="share-outline" size={18} color="#8c919d" />
          <Text style={styles.count}>{shares}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onToggleSave}
          style={[styles.button, styles.buttonCompact, isSaved && styles.buttonActive]}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isSaved ? '#f4f5f7' : '#8c919d'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#111216',
    marginTop: 8,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16181f',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonCompact: {
    paddingHorizontal: 10,
  },
  buttonActive: {
    backgroundColor: '#2536b8',
  },
  buttonDangerActive: {
    backgroundColor: '#30171a',
  },
  count: {
    color: '#8c919d',
    fontSize: 13,
    fontWeight: '500',
  },
  countActive: {
    color: '#f4f5f7',
  },
  countDanger: {
    color: '#ff4d4f',
  },
});

export default ReactionBar;