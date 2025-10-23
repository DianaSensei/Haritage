import { useFeedStore } from '@/core/store/slices/feedSlice';
import { useNotificationStore } from '@/core/store/slices/notificationSlice';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { FeedItem } from '@/modules/feed/components/FeedItem';
import { AdItem, FeedItem as FeedItemType } from '@/shared/types';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, RefreshControl, StyleSheet } from 'react-native';
import { FeedHeader } from '../components/FeedHeader';

// const { height: screenHeight } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const {
    items: feedItems,
    isLoading,
    refreshing,
    hasMore,
    loadMore,
    refreshFeed,
    setRefreshing,
    filters,
    setFilters,
  } = useFeedStore();
  const { addNotification } = useNotificationStore();
  
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagQuery, setTagQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const flatListRef = useRef<FlatList>(null);

  // Mock data for demonstration (inline to avoid stale deps)
  useEffect(() => {
    if (isAuthenticated) {
      const mockFeedItems: FeedItemType[] = [
        {
          id: '1',
          type: 'video',
          content: 'Check out this amazing sunset! 🌅',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnail: 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Video+1',
          author: {
            id: 'user1',
            name: 'John Doe',
            avatar: 'https://via.placeholder.com/40x40/4ECDC4/FFFFFF?text=JD',
          },
          likes: 42,
          comments: 8,
          shares: 3,
          isLiked: false,
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          id: '2',
          type: 'image',
          content: 'Beautiful landscape from my recent trip!',
          author: {
            id: 'user2',
            name: 'Jane Smith',
            avatar: 'https://via.placeholder.com/40x40/45B7D1/FFFFFF?text=JS',
          },
          likes: 28,
          comments: 5,
          shares: 2,
          isLiked: true,
          createdAt: new Date(Date.now() - 7200000),
        },
      ];

      useFeedStore.getState().setItems(mockFeedItems);
      addNotification({
        id: 'notif1',
        title: 'Welcome to Haritage!',
        message: 'Thanks for joining our community. Start exploring amazing content!',
        type: 'success',
        isRead: false,
        createdAt: new Date(Date.now() - 1800000),
        actionUrl: '/welcome',
      });
    }
  }, [isAuthenticated, addNotification]);

  // initialize local filter values from the store
  useEffect(() => {
    if (filters) {
      setSearchQuery(filters.search || '');
      setTagQuery((filters.tags || []).join(', '));
      setDateFilter(filters.dateRange || 'all');
    }
  }, [filters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
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

  const handleLike = (id: string) => {
    console.log('Liked item:', id);
  };

  const handleComment = (id: string) => {
    console.log('Comment on item:', id);
    Alert.alert('Comment', 'Comment feature coming soon!');
  };

  const handleShare = (id: string) => {
    console.log('Share item:', id);
    Alert.alert('Share', 'Share feature coming soon!');
  };

  const handleAdPress = (ad: AdItem) => {
    Alert.alert('Ad Clicked', `Opening: ${ad.actionUrl}`);
  };
  // handleAdDismiss intentionally omitted (not used in header ad)

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const videoItems = viewableItems.filter((item: any) => 
        item.item.type === 'video'
      );
      if (videoItems.length > 0) {
        setCurrentVideoIndex(videoItems[0].index);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }: { item: FeedItemType; index: number }) => {
    const isVideoActive = item.type === 'video' && index === currentVideoIndex;
    
    return (
      <FeedItem
        item={item}
        isActive={isVideoActive}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
      />
    );
  };

  // renderAd removed (unused) - header ad is used instead

  const renderHeader = () => (
    <>
      <FeedHeader
        searchQuery={searchQuery}
        onSearchChange={(v) => { setSearchQuery(v); setFilters({ search: v }); }}
        tagQuery={tagQuery}
        onTagChange={(v) => { setTagQuery(v); setFilters({ tags: v.split(',').map(t => t.trim()).filter(Boolean) }); }}
        dateFilter={dateFilter}
        onDateFilterChange={(d) => { setDateFilter(d); setFilters({ dateRange: d }); }}
        onBellPress={() => setShowNotificationCenter(true)}
      />
    </>
  );

  const applyFilters = (items: FeedItemType[]) => {
    return items.filter((it) => {
      if (searchQuery && !it.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (tagQuery) {
        const tags = tagQuery.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        // assume item has tags in content as #tag or not; simple check against author name for demo
        const authorMatch = tags.length === 0 || tags.some(t => it.author.name.toLowerCase().includes(t));
        if (!authorMatch) return false;
      }
      if (dateFilter !== 'all') {
        const now = Date.now();
        const ageMs = now - new Date(it.createdAt).getTime();
        if (dateFilter === '24h' && ageMs > 24 * 60 * 60 * 1000) return false;
        if (dateFilter === '7d' && ageMs > 7 * 24 * 60 * 60 * 1000) return false;
        if (dateFilter === '30d' && ageMs > 30 * 24 * 60 * 60 * 1000) return false;
      }
      return true;
    });
  };

  if (!isAuthenticated) {
    return null; // This should be handled by navigation
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <FlatList
        ref={flatListRef}
        data={applyFilters(feedItems)}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={styles.feedList}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  feedList: {
    flex: 1,
  },
  header: {
    paddingBottom: 12,
  },
  filterBar: {
    marginTop: 12,
    gap: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  tagInput: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  dateButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
  }
});
