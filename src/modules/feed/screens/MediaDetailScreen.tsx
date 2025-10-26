import { useFeedStore } from '@/core/store/slices/feedSlice';
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
import { VideoPlayer } from '../components/VideoPlayer';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

export const MediaDetailScreen: React.FC = () => {
  const router = useRouter();
  const { postId, mediaIndex = '0' } = useLocalSearchParams<{ postId: string; mediaIndex?: string }>();
  const { items: feedItems } = useFeedStore();

  const currentPost = feedItems.find((item) => item.id === postId);
  const initialIndex = parseInt(mediaIndex as string, 10) || 0;

  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialIndex);
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

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="arrow-up" size={16} color="#0a66c2" />
              <Text style={styles.statText}>{currentPost.likes} Likes</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="arrow-down" size={16} color="#FF3B30" />
              <Text style={styles.statText}>{currentPost.downvotes ?? 0} Dislikes</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#818384" />
              <Text style={styles.statText}>{currentPost.comments} Comments</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="arrow-up-outline" size={20} color="#0a66c2" />
              <Text style={styles.actionText}>Upvote</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#818384" />
              <Text style={styles.actionText}>Comment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color="#818384" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={20} color="#818384" />
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
          </View>
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#818384',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 12,
    color: '#818384',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#e4e6eb',
    textAlign: 'center',
  },
});

export default MediaDetailScreen;
