import { useFeedStore } from '@/core/store/slices/feedSlice';
import { FeedItem as FeedItemType } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
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
import { VideoPlayer } from './VideoPlayer';

interface FeedItemProps {
  item: FeedItemType;
  isActive: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onMediaPress?: (postId: string, mediaIndex: number) => void;
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

export const FeedItem: React.FC<FeedItemProps> = ({
  item,
  isActive,
  onLike,
  onComment,
  onShare,
  onMediaPress,
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
  const { updateItem } = useFeedStore();

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

  const handleVoteToggle = () => {
    const nextState = voteState === 'none' ? 'upvote' : voteState === 'upvote' ? 'downvote' : 'none';
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
        <Ionicons name="link" size={16} color="#0a66c2" />
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
        <Ionicons name="open-outline" size={16} color="#818384" />
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
                  color={pollClosed ? '#4a4a4a' : isSelected ? '#0a66c2' : '#818384'}
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
          <Ionicons name="ellipsis-horizontal" size={20} color="#818384" />
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

      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={[styles.voteToggle, voteState !== 'none' && styles.voteToggleActive]}
          onPress={handleVoteToggle}
          accessibilityRole="button"
          accessibilityLabel="Toggle vote"
        >
          <Ionicons
            name={
              voteState === 'upvote'
                ? 'arrow-up'
                : voteState === 'downvote'
                ? 'arrow-down'
                : 'remove-outline'
            }
            size={20}
            color={
              voteState === 'upvote'
                ? '#0a66c2'
                : voteState === 'downvote'
                ? '#FF3B30'
                : '#e4e6eb'
            }
          />
          <View style={styles.voteMetrics}>
            <Text style={styles.voteMetricText}>↑ {likesCount}</Text>
            <Text style={styles.voteMetricText}>↓ {downvotesCount}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.commentButton}
          onPress={handleComment}
          accessibilityRole="button"
          accessibilityLabel="Open comments"
        >
          <Ionicons name="chatbubble-outline" size={18} color="#e4e6eb" />
          <Text style={styles.commentText}>{item.comments}</Text>
        </TouchableOpacity>

        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share post"
          >
            <Ionicons name="share-outline" size={18} color="#e4e6eb" />
            <Text style={styles.actionCount}>{item.shares}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={handleSaveToCollection}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Remove bookmark' : 'Save post'}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isSaved ? '#0a66c2' : '#e4e6eb'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#272729',
    marginVertical: 12,
    marginHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3a3b3c',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
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
    borderColor: '#0a66c2',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e4e6eb',
  },
  timestamp: {
    fontSize: 12,
    color: '#818384',
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
    color: '#f0f0f3',
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
    borderColor: '#343536',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#e4e6eb',
  },
  readMoreText: {
    fontSize: 13,
    color: '#0a66c2',
    fontWeight: '600',
  },
  urlPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1f1f20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#343536',
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
    color: '#e4e6eb',
  },
  urlPreviewDescription: {
    fontSize: 12,
    color: '#b1b2b6',
  },
  urlPreviewUrl: {
    fontSize: 12,
    color: '#818384',
  },
  pollBox: {
    backgroundColor: '#1f1f20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#343536',
    padding: 14,
    gap: 12,
  },
  pollQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e4e6eb',
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
    borderColor: '#343536',
    backgroundColor: '#272729',
  },
  pollOptionSelected: {
    borderColor: '#0a66c2',
    backgroundColor: '#21242d',
  },
  pollOptionDisabled: {
    opacity: 0.6,
  },
  pollOptionText: {
    fontSize: 13,
    color: '#e4e6eb',
    flex: 1,
  },
  pollOptionTextDisabled: {
    color: '#7d7f83',
  },
  pollFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollMeta: {
    fontSize: 12,
    color: '#818384',
  },
  pollSelection: {
    fontSize: 12,
    color: '#0a66c2',
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#343536',
    backgroundColor: '#1f1f20',
    gap: 16,
  },
  voteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#343536',
    backgroundColor: '#272729',
  },
  voteToggleActive: {
    borderColor: '#0a66c2',
  },
  voteMetrics: {
    flexDirection: 'column',
    gap: 2,
  },
  voteMetricText: {
    fontSize: 12,
    color: '#e4e6eb',
    fontWeight: '600',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#343536',
    backgroundColor: '#272729',
  },
  commentText: {
    fontSize: 13,
    color: '#e4e6eb',
    fontWeight: '500',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#343536',
    backgroundColor: '#272729',
  },
  actionCount: {
    fontSize: 12,
    color: '#e4e6eb',
    fontWeight: '500',
  },
});