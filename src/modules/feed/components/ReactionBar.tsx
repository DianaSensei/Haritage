import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/shared/hooks';

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
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const neutralColor = colors.textMuted;
  const activeTextColor = '#ffffff';
  const dangerColor = colors.danger;

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
            color={isLiked ? activeTextColor : neutralColor}
          />
          <Text style={[styles.count, { color: isLiked ? activeTextColor : neutralColor }]}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onToggleDownvote}
          style={[styles.button, isDownvoted && styles.buttonDangerActive]}
        >
          <Ionicons
            name={isDownvoted ? 'arrow-down' : 'arrow-down-outline'}
            size={18}
            color={isDownvoted ? dangerColor : neutralColor}
          />
          <Text style={[styles.count, { color: isDownvoted ? dangerColor : neutralColor }]}>{downvotes}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.group}>
        <TouchableOpacity onPress={onComment} style={[styles.button, styles.buttonCompact]}>
          <Ionicons name="chatbubble-outline" size={18} color={neutralColor} />
          <Text style={[styles.count, { color: neutralColor }]}>{comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onShare} style={[styles.button, styles.buttonCompact]}>
          <Ionicons name="share-outline" size={18} color={neutralColor} />
          <Text style={[styles.count, { color: neutralColor }]}>{shares}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onToggleSave}
          style={[styles.button, styles.buttonCompact, isSaved && styles.buttonActive]}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isSaved ? activeTextColor : neutralColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 18,
      backgroundColor: colors.surfaceSecondary,
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
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonCompact: {
      paddingHorizontal: 10,
    },
    buttonActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    buttonDangerActive: {
      backgroundColor: colors.dangerSoft,
      borderColor: colors.danger,
    },
    count: {
      fontSize: 13,
      fontWeight: '500',
    },
  });

export default ReactionBar;