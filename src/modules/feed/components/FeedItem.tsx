import { Colors } from '@/core/config/theme';
import { useFeedStore } from '@/core/store/slices/feedSlice';
import { useAppTheme } from '@/shared/hooks';
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
    setIsSaved((prev) => !prev);
    updateItem(item.id, { isSaved: !isSaved });
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
  const cardBackground = isDark ? colors.surfaceTertiary : colors.card;
  const sectionBackground = isDark ? colors.surfaceSecondary : colors.surfaceSecondary;
  const controlBackground = isDark ? colors.surfaceTertiary : colors.surface;
  const outlineColor = isDark ? colors.borderMuted : colors.border;
  const dividerColor = isDark ? colors.border : colors.divider;
  const shadowColor = isDark ? '#000000' : 'rgba(15, 17, 19, 0.12)';

  return StyleSheet.create({
    container: {
      backgroundColor: cardBackground,
      marginVertical: 12,
      marginHorizontal: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: outlineColor,
      overflow: 'hidden',
      shadowColor,
      shadowOffset: { width: 0, height: isDark ? 10 : 8 },
      shadowOpacity: isDark ? 0.35 : 0.18,
      shadowRadius: isDark ? 12 : 14,
      elevation: isDark ? 8 : 5,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: dividerColor,
      backgroundColor: cardBackground,
    },
    authorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.accent,
    },
    authorDetails: {
      flex: 1,
    },
    authorName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    timestamp: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    moreButton: {
      padding: 6,
    },
    body: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      lineHeight: 24,
    },
    primaryImage: {
      width: screenWidth - 48,
      height: (screenWidth - 48) * 0.6,
      borderRadius: 12,
    },
    primaryVideoWrapper: {
      width: screenWidth - 48,
      height: (screenWidth - 48) * 0.6,
      borderRadius: 12,
      overflow: 'hidden',
    },
    mediaGallery: {
      marginTop: 8,
    },
    mediaItem: {
      marginRight: 10,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: dividerColor,
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.16,
      shadowRadius: 4,
      elevation: isDark ? 4 : 2,
    },
    mediaImage: {
      width: 130,
      height: 130,
    },
    mediaVideo: {
      width: 160,
      height: 120,
    },
    contentSection: {
      gap: 6,
    },
    contentText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
    },
    readMoreText: {
      fontSize: 13,
      color: colors.textLink,
      fontWeight: '600',
    },
    urlPreviewBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: sectionBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: outlineColor,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    urlPreviewContent: {
      flex: 1,
      gap: 4,
    },
    urlPreviewTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    urlPreviewDescription: {
      fontSize: 12,
      color: colors.textMuted,
    },
    urlPreviewUrl: {
      fontSize: 12,
      color: colors.textMuted,
    },
    pollBox: {
      backgroundColor: sectionBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: outlineColor,
      padding: 14,
      gap: 12,
    },
    pollQuestion: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    pollOptions: {
      gap: 10,
    },
    pollOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
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
      fontSize: 13,
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
      fontSize: 12,
      color: colors.textMuted,
    },
    pollSelection: {
      fontSize: 12,
      color: colors.accent,
      fontWeight: '600',
    },
    reactionBar: {
      marginBottom: 12,
      borderTopWidth: 1,
      borderTopColor: dividerColor,
      borderRadius: 0,
      backgroundColor: cardBackground,
    },
  });
};