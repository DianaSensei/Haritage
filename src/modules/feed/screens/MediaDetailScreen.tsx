import { useFeedStore } from '@/core/store/slices/feedSlice';
import { feedStorageService } from '@/shared/services/storage/feedStorageService';
import { FeedItem } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReactionBar } from '../components/ReactionBar';
import { VideoPlayer } from '../components/VideoPlayer';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

export const MediaDetailScreen: React.FC = () => {
  const router = useRouter();
  const { postId, mediaIndex = '0' } = useLocalSearchParams<{ postId: string; mediaIndex?: string }>();
  const feedItems = useFeedStore((state) => state.items);
  const updateFeedItem = useFeedStore((state) => state.updateItem);

  const currentPost = feedItems.find((item) => item.id === postId);
  const initialIndex = parseInt(mediaIndex as string, 10) || 0;

  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialIndex);
  const [pendingAction, setPendingAction] = useState<null | 'like' | 'downvote' | 'save'>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (currentPost && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: initialIndex * screenWidth,
        animated: false,
      });
    }
  }, [currentPost, initialIndex]);

  if (!currentPost) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.errorText}>Post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const mediaItems: MediaItem[] = [];

  if (currentPost.mediaUris && currentPost.mediaUris.length > 0) {
    currentPost.mediaUris.forEach((uri) => {
      const isVideo = /(\.(mp4|mov|m4v|webm|avi|mkv))$/i.test(uri);
      mediaItems.push({ uri, type: isVideo ? 'video' : 'image' });
    });
  }

  if (currentPost.videoUrl) {
    mediaItems.push({ uri: currentPost.videoUrl, type: 'video' });
  }

  if (mediaItems.length === 0 && currentPost.thumbnail && currentPost.type === 'image') {
    mediaItems.push({ uri: currentPost.thumbnail, type: 'image' });
  }

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
        setCurrentMediaIndex(index);
      },
    }
  );

  const handlePrevious = () => {
    if (currentMediaIndex > 0) {
      const nextIndex = currentMediaIndex - 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
      setCurrentMediaIndex(nextIndex);
    }
  };

  const handleNext = () => {
    if (currentMediaIndex < mediaItems.length - 1) {
      const nextIndex = currentMediaIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
      setCurrentMediaIndex(nextIndex);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const downvoteCount = currentPost.downvotes ?? 0;
  const isSaved = currentPost.isSaved ?? false;

  const snapshotPost = (item: FeedItem): FeedItem => ({
    ...item,
    author: { ...item.author },
    mediaUris: item.mediaUris ? [...item.mediaUris] : undefined,
    poll: item.poll ? { ...item.poll, options: [...item.poll.options] } : undefined,
    urlPreview: item.urlPreview ? { ...item.urlPreview } : undefined,
  });

  const applyPostUpdate = async (updates: Partial<FeedItem>) => {
    if (!currentPost) return false;
    const snapshot = snapshotPost(currentPost);
    updateFeedItem(currentPost.id, updates);
    try {
      await feedStorageService.updateFeedItem(currentPost.id, updates);
      return true;
    } catch (error) {
      console.warn('Failed to persist feed item updates', error);
      updateFeedItem(currentPost.id, snapshot);
      Alert.alert('Update failed', 'We could not update this post. Please try again.');
      return false;
    }
  };

  const handleToggleLike = async () => {
    if (!currentPost || pendingAction) return;
    setPendingAction('like');
    const nextIsLiked = !currentPost.isLiked;
    const baseLikes = currentPost.likes ?? 0;
    let nextLikes = baseLikes + (nextIsLiked ? 1 : -1);
    if (nextLikes < 0) nextLikes = 0;

    const updates: Partial<typeof currentPost> = {
      isLiked: nextIsLiked,
      likes: nextLikes,
    };

    if (nextIsLiked && currentPost.isDownvoted) {
      updates.isDownvoted = false;
      const baseDownvotes = currentPost.downvotes ?? 0;
      updates.downvotes = Math.max(0, baseDownvotes - 1);
    }

    await applyPostUpdate(updates);
    setPendingAction(null);
  };

  const handleToggleDownvote = async () => {
    if (!currentPost || pendingAction) return;
    setPendingAction('downvote');
    const nextIsDownvoted = !currentPost.isDownvoted;
    const baseDownvotes = currentPost.downvotes ?? 0;
    let nextDownvotes = baseDownvotes + (nextIsDownvoted ? 1 : -1);
    if (nextDownvotes < 0) nextDownvotes = 0;

    const updates: Partial<typeof currentPost> = {
      isDownvoted: nextIsDownvoted,
      downvotes: nextDownvotes,
    };

    if (nextIsDownvoted && currentPost.isLiked) {
      updates.isLiked = false;
      updates.likes = Math.max(0, (currentPost.likes ?? 0) - 1);
    }

    await applyPostUpdate(updates);
    setPendingAction(null);
  };

  const handleToggleSave = async () => {
    if (!currentPost || pendingAction) return;
    setPendingAction('save');
    await applyPostUpdate({ isSaved: !isSaved });
    setPendingAction(null);
  };

  const handleCommentPress = () => {
    Alert.alert('Comments', 'Commenting is coming soon.');
  };

  const handleSharePress = () => {
    Alert.alert('Share', 'Sharing is coming soon.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Media</Text>
          <View style={styles.headerSpace} />
        </View>

        {/* Media Viewer */}
        <View style={styles.mediaContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            onScroll={handleScroll}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={mediaItems.length > 1}
          >
            {mediaItems.map((media, index) => (
              <View key={`${postId}-media-${index}`} style={styles.mediaPage}>
                {media.type === 'video' ? (
                  <VideoPlayer
                    videoUrl={media.uri}
                    thumbnail={currentPost.thumbnail}
                    isActive={index === currentMediaIndex}
                    onError={(error) => Alert.alert('Video Error', error)}
                  />
                ) : (
                  <Image
                    source={{ uri: media.uri }}
                    style={styles.mediaImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            ))}
          </ScrollView>

          {/* Navigation Controls */}
          {mediaItems.length > 1 && (
            <>
              {currentMediaIndex > 0 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonLeft]}
                  onPress={handlePrevious}
                >
                  <Ionicons name="chevron-back" size={32} color="#fff" />
                </TouchableOpacity>
              )}

              {currentMediaIndex < mediaItems.length - 1 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonRight]}
                  onPress={handleNext}
                >
                  <Ionicons name="chevron-forward" size={32} color="#fff" />
                </TouchableOpacity>
              )}

              <View style={styles.indicatorContainer}>
                <Text style={styles.indicatorText}>
                  {currentMediaIndex + 1} / {mediaItems.length}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Post Info Section */}
        <ScrollView style={styles.infoSection} showsVerticalScrollIndicator={false}>
          {/* Author Info */}
          <View style={styles.authorRow}>
            <Image
              source={{ uri: currentPost.author.avatar }}
              style={styles.authorAvatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{currentPost.author.name}</Text>
              <Text style={styles.timestamp}>{formatTimeAgo(currentPost.createdAt)}</Text>
            </View>
          </View>

          {/* Post Title & Content */}
          {currentPost.title && (
            <Text style={styles.postTitle}>{currentPost.title}</Text>
          )}

          {currentPost.content && (
            <Text style={styles.postContent}>{currentPost.content}</Text>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          <ReactionBar
            likes={currentPost.likes ?? 0}
            downvotes={downvoteCount}
            comments={currentPost.comments ?? 0}
            shares={currentPost.shares ?? 0}
            isLiked={currentPost.isLiked ?? false}
            isDownvoted={currentPost.isDownvoted ?? false}
            isSaved={isSaved}
            onToggleLike={handleToggleLike}
            onToggleDownvote={handleToggleDownvote}
            onComment={handleCommentPress}
            onShare={handleSharePress}
            onToggleSave={handleToggleSave}
            disabled={pendingAction !== null}
            style={styles.reactionBarSpacing}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#343536',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e4e6eb',
  },
  headerSpace: {
    width: 40,
  },
  mediaContainer: {
    position: 'relative',
    width: screenWidth,
    height: screenHeight * 0.5,
    backgroundColor: '#000',
  },
  mediaPage: {
    width: screenWidth,
    height: screenHeight * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%',
    marginTop: -25,
  },
  navButtonLeft: {
    left: 16,
  },
  navButtonRight: {
    right: 16,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  indicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  infoSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#0a66c2',
  },
  authorInfo: {
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
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f0f0f3',
    marginBottom: 12,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#e4e6eb',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#343536',
    marginVertical: 12,
  },
  reactionBarSpacing: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#e4e6eb',
    textAlign: 'center',
  },
});

export default MediaDetailScreen;
