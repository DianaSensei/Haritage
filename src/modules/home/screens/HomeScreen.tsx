import { useFeedStore } from '@/core/store/slices/feedSlice';
import { useNotificationStore } from '@/core/store/slices/notificationSlice';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { FeedItem } from '@/modules/feed/components/FeedItem';
import { feedStorageService } from '@/shared/services/storage/feedStorageService';
import { FeedItem as FeedItemType } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, FlatList, RefreshControl, Text as RNText, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { GlassyFAB } from '../components/GlassyFAB';

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    items: feedItems,
    isLoading,
    refreshing,
    hasMore,
    loadMore,
    refreshFeed,
    setRefreshing,
  } = useFeedStore();
  const { addNotification } = useNotificationStore();

  const [currentVideoIndex, setCurrentVideoIndex] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [activeFilter, setActiveFilter] = useState<string>('For you');
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);
  const fabOpacity = useRef(new Animated.Value(1)).current;

  const feedStats = useMemo(() => {
    const postCount = feedItems.length;
    const totalLikes = feedItems.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = feedItems.reduce((sum, post) => sum + post.comments, 0);

    return {
      postCount,
      totalLikes,
      totalComments,
    };
  }, [feedItems]);

  const filterChips = ['For you', 'Nearby', 'Popular', 'Following'];

  const loadFeedData = useCallback(async () => {
    try {
      // Try to load from local storage first
      const storedItems = await feedStorageService.getFeedItems();
      
      if (storedItems && storedItems.length > 0) {
        // Use persisted data
        useFeedStore.getState().setItems(storedItems);
      } else {
        // Use mock data as fallback and save it
        const mockFeedItems: FeedItemType[] = [
        {
          id: '1',
          type: 'image',
          title: 'Golden Hour Over the Coast',
          content: 'The sky exploded with color tonight—definitely worth the detour after work. Captured a few frames before the light faded.',
          mediaUris: [
            'https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
          ],
          urlPreview: {
            title: '5 Tips for Capturing Sunset Photos',
            description: 'Practical advice for shooting with any camera during golden hour.',
            url: 'https://example.com/sunset-guide',
          },
          author: {
            id: 'user1',
            name: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
          },
          likes: 245,
          downvotes: 12,
          comments: 28,
          shares: 15,
          isLiked: false,
          isSaved: true,
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          id: '2',
          type: 'video',
          title: 'Midnight City Time-Lapse',
          content: 'Quick handheld time-lapse while waiting for the last train. The reflections made the skyline feel alive.',
          videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
          mediaUris: [
            'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1200&q=80',
          ],
          author: {
            id: 'user2',
            name: 'Mike Chen',
            avatar: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=200&q=60',
          },
          likes: 156,
          downvotes: 8,
          comments: 34,
          shares: 22,
          isLiked: true,
          createdAt: new Date(Date.now() - 7200000),
        },
        {
          id: '3',
          type: 'text',
          title: 'Best Coffee Shops in Downtown',
          content: 'Found this hidden gem coffee shop with the most amazing espresso. Great ambiance, friendly staff, and the playlist was on point!',
          poll: {
            question: "What's your ideal coffee shop vibe?",
            options: ['Cozy & Quiet', 'Energetic & Social', 'Minimal & Bright', 'Vintage Charm'],
            closeHours: 12,
          },
          author: {
            id: 'user3',
            name: 'Emma Wilson',
            avatar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=60',
          },
          likes: 89,
          downvotes: 5,
          comments: 16,
          shares: 8,
          isLiked: false,
          createdAt: new Date(Date.now() - 10800000),
        },
        {
          id: '4',
          type: 'image',
          title: 'Mountain Hike Adventure',
          content: 'Hiked to the peak this weekend. The view was absolutely breathtaking! Worth every step.',
          mediaUris: [
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
          ],
          author: {
            id: 'user4',
            name: 'Alex Mountain',
            avatar: 'https://images.unsplash.com/photo-1500625046104-dbf1115e4d81?auto=format&fit=crop&w=200&q=60',
          },
          likes: 312,
          downvotes: 4,
          comments: 45,
          shares: 28,
          isLiked: false,
          createdAt: new Date(Date.now() - 14400000),
        },
        {
          id: '5',
          type: 'text',
          title: 'Photography Tips for Beginners',
          content: 'Just started my photography journey! Any tips from the experienced photographers here? I\'m especially interested in landscape and portrait photography.',
          author: {
            id: 'user5',
            name: 'Jordan Bell',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=60',
          },
          likes: 67,
          downvotes: 2,
          comments: 23,
          shares: 5,
          isLiked: false,
          createdAt: new Date(Date.now() - 18000000),
        },
        {
          id: '6',
          type: 'image',
          title: 'Urban Photography Series',
          content: 'Exploring the hidden beauty of the city streets. Every corner tells a story.',
          mediaUris: [
            'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1537457747152-b8920b390c60?auto=format&fit=crop&w=1200&q=80',
          ],
          author: {
            id: 'user6',
            name: 'Casey Urban',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=60',
          },
          likes: 428,
          downvotes: 6,
          comments: 56,
          shares: 38,
          isLiked: true,
          isSaved: true,
          createdAt: new Date(Date.now() - 21600000),
        },
        {
          id: '7',
          type: 'video',
          title: 'Aurora Borealis Timelapse',
          content: 'Finally got to witness the Northern Lights. Shot this timelapse over several hours. Nature is truly amazing!',
          videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80',
          mediaUris: [],
          author: {
            id: 'user7',
            name: 'Aurora Sky',
            avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=60',
          },
          likes: 892,
          downvotes: 3,
          comments: 89,
          shares: 156,
          isLiked: false,
          createdAt: new Date(Date.now() - 25200000),
        },
        {
          id: '8',
          type: 'text',
          title: 'Travel Recommendations for Summer',
          content: 'Planning a summer trip! Looking for off-the-beaten-path destinations. Any suggestions from fellow travelers?',
          poll: {
            question: 'Where should I go this summer?',
            options: ['Beach', 'Mountains', 'City', 'Desert'],
            closeHours: 24,
          },
          author: {
            id: 'user8',
            name: 'Travel Lust',
            avatar: 'https://images.unsplash.com/photo-1517841905240-5e5b94f82749?auto=format&fit=crop&w=200&q=60',
          },
          likes: 154,
          downvotes: 8,
          comments: 67,
          shares: 34,
          isLiked: false,
          createdAt: new Date(Date.now() - 28800000),
        },
        {
          id: '9',
          type: 'image',
          title: 'Street Art Discovery',
          content: 'Found this amazing mural in the warehouse district. The colors and detail are incredible!',
          mediaUris: [
            'https://images.unsplash.com/photo-1577720643272-265f434d7af0?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1534561053-c4f3a9de3d59?auto=format&fit=crop&w=1200&q=80',
          ],
          urlPreview: {
            title: 'The Rise of Street Art in Modern Cities',
            description: 'How urban art is transforming city landscapes worldwide.',
            url: 'https://example.com/street-art-article',
          },
          author: {
            id: 'user9',
            name: 'ArtVision',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=60',
          },
          likes: 267,
          downvotes: 5,
          comments: 31,
          shares: 19,
          isLiked: false,
          createdAt: new Date(Date.now() - 32400000),
        },
        {
          id: '10',
          type: 'image',
          title: 'Macro Photography: Tiny Worlds',
          content: 'Exploring the microscopic world through my macro lens. Every detail tells a story.',
          mediaUris: [
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1200&q=80',
          ],
          author: {
            id: 'user10',
            name: 'Micro Explorer',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=60',
          },
          likes: 193,
          downvotes: 3,
          comments: 22,
          shares: 12,
          isLiked: false,
          createdAt: new Date(Date.now() - 36000000),
        },
        {
          id: '11',
          type: 'text',
          title: 'Best Camera Settings for Blue Hour',
          content: 'Blue hour (twilight) is the best time for photography. Here are my tried-and-tested camera settings: ISO 800-1600, f/2.8-f/4, shutter speed 1/30-1/60. What settings do you prefer?',
          author: {
            id: 'user1',
            name: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
          },
          likes: 145,
          downvotes: 2,
          comments: 38,
          shares: 14,
          isLiked: false,
          createdAt: new Date(Date.now() - 39600000),
        },
        {
          id: '12',
          type: 'video',
          title: 'Beach Sunset Cinematic Video',
          content: 'Cinematic video of the beach at sunset. Featuring smooth camera movements and natural colors.',
          videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1500019229763-d6e40f69d17a?auto=format&fit=crop&w=1200&q=80',
          mediaUris: [
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
          ],
          author: {
            id: 'user2',
            name: 'Mike Chen',
            avatar: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=200&q=60',
          },
          likes: 521,
          downvotes: 7,
          comments: 73,
          shares: 102,
          isLiked: true,
          createdAt: new Date(Date.now() - 43200000),
        },
      ];

      // Save mock data to storage for persistence
      await feedStorageService.saveFeedItems(mockFeedItems);
      useFeedStore.getState().setItems(mockFeedItems);
      }

      addNotification({
        id: 'notif1',
        title: 'Welcome to Haritage!',
        message: 'Explore amazing posts from the community',
        type: 'success',
        isRead: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error loading feed data:', error);
    }
  }, [addNotification]);

  // Load feed from storage on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadFeedData();
    }
  }, [isAuthenticated, loadFeedData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      refreshFeed();
      setRefreshing(false);
    }, 1000);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  };

  const handleLike = useCallback((id: string) => {
    console.log('Liked item:', id);
  }, []);

  const handleComment = useCallback((id: string) => {
    console.log('Comment on item:', id);
    Alert.alert('Comment', 'Opening comment thread...');
  }, []);

  const handleShare = useCallback((id: string) => {
    console.log('Share item:', id);
    Alert.alert('Share', 'Opening share dialog...');
  }, []);

  const handleComposePress = useCallback(() => {
    router.push('/create-post');
  }, [router]);

  const handleMediaPress = useCallback((postId: string, mediaIndex: number) => {
    router.push({
      pathname: '/media-detail',
      params: { postId, mediaIndex: String(mediaIndex) },
    });
  }, [router]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (!viewableItems?.length) {
      setCurrentVideoIndex(null);
      return;
    }

    const videoItem = viewableItems.find(
      (entry: any) => entry.isViewable && entry.item?.type === 'video'
    );

    if (videoItem) {
      setCurrentVideoIndex(videoItem.index);
    } else {
      setCurrentVideoIndex(null);
    }
  }).current;

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollingDown = currentScrollY > lastScrollY.current;
    
    // Tab bar collapses when scrolling down, so FAB should show
    if (scrollingDown !== isScrollingDown) {
      setIsScrollingDown(scrollingDown);
      Animated.timing(fabOpacity, {
        toValue: scrollingDown ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    
    lastScrollY.current = currentScrollY;
  };

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleVideoEnd = useCallback(() => {
    setCurrentVideoIndex(null);
  }, []);

  const renderItem = useCallback(({ item, index }: { item: FeedItemType; index: number }) => {
    const isVideoActive = item.type === 'video' && currentVideoIndex === index;

    return (
      <FeedItem
        item={item}
        isActive={isVideoActive}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onMediaPress={handleMediaPress}
        onVideoEnd={handleVideoEnd}
      />
    );
  }, [currentVideoIndex, handleLike, handleComment, handleShare, handleMediaPress, handleVideoEnd]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <RNText style={styles.headerTitle}>Discover</RNText>
        <TouchableOpacity
          style={styles.composeButton}
          onPress={handleComposePress}
          accessibilityRole="button"
          accessibilityLabel="Create post"
        >
          <Ionicons name="create-outline" size={16} color="#ffffff" />
          <RNText style={styles.composeLabel}>New post</RNText>
        </TouchableOpacity>
      </View>
      <RNText style={styles.headerSubtitle}>Stories curated for your interests</RNText>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Ionicons name="albums-outline" size={18} color="#0a66c2" />
          <View style={styles.statContent}>
            <RNText style={styles.statValue}>{feedStats.postCount.toLocaleString()}</RNText>
            <RNText style={styles.statLabel}>Posts</RNText>
          </View>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="thumbs-up-outline" size={18} color="#0a66c2" />
          <View style={styles.statContent}>
            <RNText style={styles.statValue}>{feedStats.totalLikes.toLocaleString()}</RNText>
            <RNText style={styles.statLabel}>Appreciations</RNText>
          </View>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#0a66c2" />
          <View style={styles.statContent}>
            <RNText style={styles.statValue}>{feedStats.totalComments.toLocaleString()}</RNText>
            <RNText style={styles.statLabel}>Conversations</RNText>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {filterChips.map((chip) => {
          const isActive = chip === activeFilter;
          return (
            <TouchableOpacity
              key={chip}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(chip)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <RNText
                style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
              >
                {chip}
              </RNText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  if (!isAuthenticated) {
    return null;
  }

  // Show empty state when no posts
  if (feedItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState isLoading={isLoading} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ref={flatListRef}
        data={feedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View style={styles.footerSpace} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0a66c2"
            colors={['#0a66c2']}
            progressBackgroundColor="#1a1a1b"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={styles.feedList}
      />
      {/* Glassmorphic FAB - shows when scrolling and tab bar collapses */}
      <GlassyFAB
        isVisible={isScrollingDown}
        isTabBarVisible={!isScrollingDown}
        opacity={fabOpacity}
        onPress={handleComposePress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1b',
  },
  feedList: {
    flex: 1,
    backgroundColor: '#1a1a1b',
  },
  listContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 120,
    backgroundColor: '#1a1a1b',
  },
  header: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    gap: 16,
    backgroundColor: '#1a1a1b',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e4e6eb',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#818384',
  },
  composeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#0a66c2',
    shadowColor: '#0a66c2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  composeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#272729',
    borderWidth: 1,
    borderColor: '#343536',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flex: 1,
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e4e6eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#818384',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  filterScroll: {
    marginTop: 4,
  },
  filterContent: {
    paddingRight: 12,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#343536',
    backgroundColor: '#1f1f20',
  },
  filterChipActive: {
    backgroundColor: '#0a66c2',
    borderColor: '#0a66c2',
  },
  filterChipText: {
    fontSize: 13,
    color: '#e4e6eb',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0a66c2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#0a66c2',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  footerSpace: {
    height: 48,
  },
});

export default HomeScreen;