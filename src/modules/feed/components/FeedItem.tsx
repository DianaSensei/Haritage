import { Colors, Radii, Spacing, Typography } from '@/core/config/theme';
import { useFeedStore } from '@/core/store/slices/feedSlice';
import { useAppTheme } from '@/shared/hooks';
import { feedStorageService } from '@/shared/services/storage/feedStorageService';
import { FeedItem as FeedItemType } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { memo, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ReactionBar } from './ReactionBar';
import { VideoPlayer } from './VideoPlayer';

interface FeedItemProps {
  item: FeedItemType;
  isActive: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onMediaPress?: (postId: string, mediaIndex: number) => void;
  onVideoEnd?: (id: string) => void;
}

type MediaDescriptor = {
  uri: string;
  type: 'image' | 'video';
};

const { width: screenWidth } = Dimensions.get('window');
const VIDEO_EXTENSION_REGEX = /(\.(mp4|mov|m4v|webm|avi|mkv))$/i;

const isVideoUri = (uri: string) => VIDEO_EXTENSION_REGEX.test(uri);

const isValidUrl = (value?: string | null) => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return Boolean(parsed.protocol && parsed.hostname);
  } catch {
    return false;
  }
};

const getHostname = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
};

const FeedItemComponent: React.FC<FeedItemProps> = ({
  item,
  isActive,
  onLike,
  onComment,
  onShare,
  onMediaPress,
  onVideoEnd,
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const [voteState, setVoteState] = useState<'upvote' | 'downvote' | 'none'>(() => {
    if (item.isDownvoted) return 'downvote';
    if (item.isLiked) return 'upvote';
    return 'none';
  });
  const [likesCount, setLikesCount] = useState(item.likes);
  const [downvotesCount, setDownvotesCount] = useState(item.downvotes ?? 0);
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(item.isSaved ?? false);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const updateItem = useFeedStore((state) => state.updateItem);

  useEffect(() => {
    setVoteState(item.isDownvoted ? 'downvote' : item.isLiked ? 'upvote' : 'none');
    setLikesCount(item.likes);
    setDownvotesCount(item.downvotes ?? 0);
    setIsSaved(item.isSaved ?? false);
  }, [item.id, item.isDownvoted, item.isLiked, item.likes, item.downvotes, item.isSaved]);

  const pollClosed = useMemo(() => {
    if (!item.poll || item.poll.closeHours === undefined) {
      return false;
    }
    return item.poll.closeHours <= 0;
  }, [item.poll]);

  const previewUrl = useMemo(() => {
    if (item.urlPreview?.url) return item.urlPreview.url;
    if (item.url && isValidUrl(item.url)) return item.url;
    return null;
  }, [item.url, item.urlPreview]);

  const mediaItems = useMemo<MediaDescriptor[]>(() => {
    const combined: MediaDescriptor[] = [];

    if (item.mediaUris && item.mediaUris.length > 0) {
      const descriptors: MediaDescriptor[] = item.mediaUris
        .filter((uri): uri is string => Boolean(uri))
        .map<MediaDescriptor>((uri) => ({
          uri,
          type: isVideoUri(uri) ? 'video' : 'image',
        }));

      combined.push(...descriptors);
    }

    if (item.videoUrl) {
      combined.push({ uri: item.videoUrl, type: 'video' });
    }

    if (combined.length === 0 && item.thumbnail && item.type === 'image') {
      combined.push({ uri: item.thumbnail, type: 'image' });
    }

    const unique: MediaDescriptor[] = [];
    const seen = new Set<string>();

    combined.forEach((descriptor) => {
      if (seen.has(descriptor.uri)) return;
      seen.add(descriptor.uri);
      unique.push(descriptor);
    });

    return unique;
  }, [item.mediaUris, item.thumbnail, item.type, item.videoUrl]);

  const primaryMedia = useMemo<MediaDescriptor | null>(
    () => (mediaItems.length > 0 ? mediaItems[0] : null),
    [mediaItems],
  );

  const secondaryMedia = useMemo<MediaDescriptor[]>(
    () => (mediaItems.length > 1 ? mediaItems.slice(1) : []),
    [mediaItems],
  );

  const contentIsLong = item.content ? item.content.length > 160 : false;

  const applyVote = (nextState: 'upvote' | 'downvote' | 'none') => {
    let updatedLikes = likesCount;
    let updatedDownvotes = downvotesCount;

    if (voteState === 'upvote') {
      updatedLikes = Math.max(0, updatedLikes - 1);
    } else if (voteState === 'downvote') {
      updatedDownvotes = Math.max(0, updatedDownvotes - 1);
    }

    if (nextState === 'upvote') {
      updatedLikes += 1;
    } else if (nextState === 'downvote') {
      updatedDownvotes += 1;
    }

    setVoteState(nextState);
    setLikesCount(updatedLikes);
    setDownvotesCount(updatedDownvotes);

    updateItem(item.id, {
      likes: updatedLikes,
      downvotes: updatedDownvotes,
      isLiked: nextState === 'upvote',
      isDownvoted: nextState === 'downvote',
    });

    onLike(item.id);
  };

  const handleToggleUpvote = () => {
    const nextState = voteState === 'upvote' ? 'none' : 'upvote';
    applyVote(nextState);
  };

  const handleToggleDownvote = () => {
    const nextState = voteState === 'downvote' ? 'none' : 'downvote';
    applyVote(nextState);
  };

  const handlePollOptionPress = (option: string) => {
    if (pollClosed) return;
    setSelectedPollOption((prev) => (prev === option ? null : option));
  };

  const handleComment = () => {
    onComment(item.id);
  };

  const handleShare = () => {
    onShare(item.id);
  };

  const handleSaveToCollection = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    updateItem(item.id, { isSaved: nextSaved });

    feedStorageService
      .updateFeedItem(item.id, { isSaved: nextSaved })
      .catch((error) => {
        console.warn('Failed to persist saved state', error);
      });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const renderMediaGallery = (media: MediaDescriptor[]) => {
    if (!media.length) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mediaGallery}
        scrollEventThrottle={16}
      >
        {media.map((descriptor, index) => {
          // Calculate the actual index in the full media list
          const actualMediaIndex = primaryMedia ? index + 1 : index;
          return (
            <TouchableOpacity
              key={`${item.id}-media-${index}`}
              style={styles.mediaItem}
              activeOpacity={0.9}
              onPress={() => onMediaPress?.(item.id, actualMediaIndex)}
            >
              {descriptor.type === 'video' ? (
                <View style={styles.mediaVideo}>
                  <VideoPlayer
                    videoUrl={descriptor.uri}
                    thumbnail={item.thumbnail}
                    isActive={false}
                    onError={(error) => Alert.alert('Video Error', error)}
                    onPlaybackStatusUpdate={(status) => {
                      if (status?.didJustFinish) {
                        onVideoEnd?.(item.id);
                      }
                    }}
                  />
                </View>
              ) : (
                <Image
                  source={{ uri: descriptor.uri }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderPrimaryMedia = () => {
    if (!primaryMedia) return null;

    if (primaryMedia.type === 'video') {
      return (
        <TouchableOpacity
          style={styles.primaryVideoWrapper}
          activeOpacity={0.9}
          onPress={() => onMediaPress?.(item.id, 0)}
        >
          <VideoPlayer
            videoUrl={primaryMedia.uri}
            thumbnail={item.thumbnail}
            isActive={isActive}
            onError={(error) => Alert.alert('Video Error', error)}
            onPlaybackStatusUpdate={(status) => {
              if (status?.didJustFinish) {
                onVideoEnd?.(item.id);
              }
            }}
          />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onMediaPress?.(item.id, 0)}
      >
        <Image
          source={{ uri: primaryMedia.uri }}
          style={styles.primaryImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderUrlPreview = () => {
    if (!previewUrl) return null;

    const title = item.urlPreview?.title ?? getHostname(previewUrl);
    const description = item.urlPreview?.description;

    const handleOpenLink = () => {
      Linking.openURL(previewUrl).catch(() => {
        Alert.alert('Unable to open link');
      });
    };

    return (
      <TouchableOpacity
        style={styles.urlPreviewBox}
        onPress={handleOpenLink}
        activeOpacity={0.85}
      >
        <Ionicons name="link" size={16} color={colors.accent} />
        <View style={styles.urlPreviewContent}>
          <Text style={styles.urlPreviewTitle} numberOfLines={1}>
            {title}
          </Text>
          {description ? (
            <Text style={styles.urlPreviewDescription} numberOfLines={2}>
              {description}
            </Text>
          ) : null}
          <Text style={styles.urlPreviewUrl} numberOfLines={1}>
            {getHostname(previewUrl)}
          </Text>
        </View>
        <Ionicons name="open-outline" size={16} color={colors.iconMuted} />
      </TouchableOpacity>
    );
  };

  const renderPoll = () => {
    if (!item.poll) return null;

    return (
      <View style={styles.pollBox}>
        <Text style={styles.pollQuestion}>{item.poll.question}</Text>
        <View style={styles.pollOptions}>
          {item.poll.options.map((option) => {
            const isSelected = selectedPollOption === option;
            return (
              <TouchableOpacity
                key={`${item.id}-poll-${option}`}
                style={[
                  styles.pollOption,
                  isSelected && styles.pollOptionSelected,
                  pollClosed && styles.pollOptionDisabled,
                ]}
                activeOpacity={0.8}
                onPress={() => handlePollOptionPress(option)}
                disabled={pollClosed}
              >
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={pollClosed ? colors.iconMuted : isSelected ? colors.accent : colors.icon}
                />
                <Text
                  style={[
                    styles.pollOptionText,
                    pollClosed && styles.pollOptionTextDisabled,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.pollFooter}>
          {item.poll.closeHours !== undefined && (
            <Text style={styles.pollMeta}>
              {pollClosed ? 'Poll closed' : `Closes in ${item.poll.closeHours}h`}
            </Text>
          )}
          {selectedPollOption && !pollClosed && (
            <Text style={styles.pollSelection}>Selected: {selectedPollOption}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Image source={{ uri: item.author.avatar }} style={styles.avatar} />
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{item.author.name}</Text>
            <Text style={styles.timestamp}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.iconMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {item.title ? <Text style={styles.title}>{item.title}</Text> : null}
        {renderPrimaryMedia()}
        {renderMediaGallery(secondaryMedia)}

        {item.content ? (
          <View style={styles.contentSection}>
            <Text
              style={styles.contentText}
              numberOfLines={showFullText ? undefined : 3}
            >
              {item.content}
            </Text>
            {contentIsLong ? (
              <TouchableOpacity onPress={() => setShowFullText((prev) => !prev)}>
                <Text style={styles.readMoreText}>
                  {showFullText ? 'Show less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {renderUrlPreview()}
        {renderPoll()}
      </View>

      <ReactionBar
        likes={likesCount}
        downvotes={downvotesCount}
        comments={item.comments ?? 0}
        shares={item.shares ?? 0}
        isLiked={voteState === 'upvote'}
        isDownvoted={voteState === 'downvote'}
        isSaved={isSaved}
        onToggleLike={handleToggleUpvote}
        onToggleDownvote={handleToggleDownvote}
        onComment={handleComment}
        onShare={handleShare}
        onToggleSave={handleSaveToCollection}
        style={styles.reactionBar}
      />
    </View>
  );
};

const areEqual = (prev: FeedItemProps, next: FeedItemProps) => {
  if (prev.isActive !== next.isActive) {
    return false;
  }

  if (prev.onVideoEnd !== next.onVideoEnd) {
    return false;
  }

  if (prev.item === next.item) {
    return true;
  }

  const prevItem = prev.item;
  const nextItem = next.item;

  if (prevItem.id !== nextItem.id) {
    return false;
  }

  return (
    prevItem.likes === nextItem.likes &&
    (prevItem.downvotes ?? 0) === (nextItem.downvotes ?? 0) &&
    prevItem.isLiked === nextItem.isLiked &&
    prevItem.isDownvoted === nextItem.isDownvoted &&
    prevItem.isSaved === nextItem.isSaved &&
    prevItem.comments === nextItem.comments &&
    prevItem.shares === nextItem.shares &&
    prevItem.title === nextItem.title &&
    prevItem.content === nextItem.content &&
    prevItem.thumbnail === nextItem.thumbnail &&
    prevItem.videoUrl === nextItem.videoUrl &&
    prevItem.mediaUris === nextItem.mediaUris &&
    prevItem.urlPreview === nextItem.urlPreview &&
    prevItem.poll === nextItem.poll
  );
};

export const FeedItem = memo(FeedItemComponent, areEqual);

const createStyles = (colors: typeof Colors.light, isDark: boolean) => {
  const cardBackground = colors.card;
  const sectionBackground = colors.surfaceSecondary;
  const controlBackground = colors.surface;
  const outlineColor = colors.border;
  const dividerColor = colors.divider;
  const shadowColor = colors.shadowSubtle;

  return StyleSheet.create({
    container: {
      backgroundColor: cardBackground,
      marginVertical: Spacing.sm,
      marginHorizontal: Spacing.md,
      borderRadius: Radii.md,
      borderWidth: 1,
      borderColor: outlineColor,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: dividerColor,
      backgroundColor: cardBackground,
    },
    authorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: Spacing.md,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: colors.accent,
    },
    authorDetails: {
      flex: 1,
    },
    authorName: {
      fontSize: Typography.size.sm,
      lineHeight: Typography.lineHeight.sm,
      fontWeight: Typography.weight.semibold,
      color: colors.text,
    },
    timestamp: {
      fontSize: Typography.size.xs,
      lineHeight: Typography.lineHeight.xs,
      color: colors.textMuted,
      marginTop: 2,
    },
    moreButton: {
      padding: Spacing.xs,
    },
    body: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      gap: Spacing.md,
    },
    title: {
      fontSize: Typography.size.lg,
      lineHeight: Typography.lineHeight.lg,
      fontWeight: Typography.weight.bold,
      color: colors.text,
    },
    primaryImage: {
      width: screenWidth - (Spacing.md * 2) - (Spacing.lg * 2),
      height: (screenWidth - (Spacing.md * 2) - (Spacing.lg * 2)) * 0.6,
      borderRadius: Radii.md,
    },
    primaryVideoWrapper: {
      width: screenWidth - (Spacing.md * 2) - (Spacing.lg * 2),
      height: (screenWidth - (Spacing.md * 2) - (Spacing.lg * 2)) * 0.6,
      borderRadius: Radii.md,
      overflow: 'hidden',
    },
    mediaGallery: {
      marginTop: Spacing.sm,
    },
    mediaItem: {
      marginRight: Spacing.sm,
      borderRadius: Radii.sm,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: dividerColor,
      shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
    mediaImage: {
      width: 120,
      height: 120,
    },
    mediaVideo: {
      width: 150,
      height: 110,
    },
    contentSection: {
      gap: Spacing.xs,
    },
    contentText: {
      fontSize: Typography.size.md,
      lineHeight: Typography.lineHeight.md,
      color: colors.text,
    },
    readMoreText: {
      fontSize: Typography.size.sm,
      lineHeight: Typography.lineHeight.sm,
      color: colors.textLink,
      fontWeight: Typography.weight.semibold,
    },
    urlPreviewBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      backgroundColor: sectionBackground,
      borderRadius: Radii.sm,
      borderWidth: 1,
      borderColor: outlineColor,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
    },
    urlPreviewContent: {
      flex: 1,
      gap: Spacing.xs,
    },
    urlPreviewTitle: {
      fontSize: Typography.size.sm,
      lineHeight: Typography.lineHeight.sm,
      fontWeight: Typography.weight.semibold,
      color: colors.text,
    },
    urlPreviewDescription: {
      fontSize: Typography.size.xs,
      lineHeight: Typography.lineHeight.xs,
      color: colors.textMuted,
    },
    urlPreviewUrl: {
      fontSize: Typography.size.xs,
      lineHeight: Typography.lineHeight.xs,
      color: colors.textSubtle,
    },
    pollBox: {
      backgroundColor: sectionBackground,
      borderRadius: Radii.sm,
      borderWidth: 1,
      borderColor: outlineColor,
      padding: Spacing.md,
      gap: Spacing.md,
    },
    pollQuestion: {
      fontSize: Typography.size.md,
      lineHeight: Typography.lineHeight.md,
      fontWeight: Typography.weight.semibold,
      color: colors.text,
    },
    pollOptions: {
      gap: Spacing.sm,
    },
    pollOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: Radii.sm,
      borderWidth: 1,
      borderColor: dividerColor,
      backgroundColor: controlBackground,
    },
    pollOptionSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accentSoft,
    },
    pollOptionDisabled: {
      opacity: 0.6,
    },
    pollOptionText: {
      fontSize: Typography.size.sm,
      lineHeight: Typography.lineHeight.sm,
      color: colors.text,
      flex: 1,
    },
    pollOptionTextDisabled: {
      color: colors.textMuted,
    },
    pollFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pollMeta: {
      fontSize: Typography.size.xs,
      lineHeight: Typography.lineHeight.xs,
      color: colors.textMuted,
    },
    pollSelection: {
      fontSize: Typography.size.xs,
      lineHeight: Typography.lineHeight.xs,
      color: colors.accent,
      fontWeight: Typography.weight.semibold,
    },
    reactionBar: {
      marginBottom: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: dividerColor,
      borderRadius: 0,
      backgroundColor: cardBackground,
    },
  });
};