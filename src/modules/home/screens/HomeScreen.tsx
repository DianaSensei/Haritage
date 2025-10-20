import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useFeedStore } from '@/core/store/slices/feedSlice';
import { useNotificationStore } from '@/core/store/slices/notificationSlice';
import { UserInfoBlock } from '../components/UserInfoBlock';
import { FeedItem } from '@/modules/feed/components/FeedItem';
import { AdBanner } from '@/modules/ads/components/AdBanner';
import { NotificationCenter } from '@/modules/notifications/components/NotificationCenter';
import { NotificationBell } from '@/modules/notifications/components/NotificationBell';
import { FeedItem as FeedItemType, AdItem, Notification } from '@/shared/types';

const { height: screenHeight } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
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
  
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Mock data for demonstration
  useEffect(() => {
    if (isAuthenticated) {
      loadMockData();
    }
  }, [isAuthenticated]);

  const loadMockData = () => {
    // Mock feed items
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
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
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
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
      },
    ];

    // Mock ads
    const mockAds: AdItem[] = [
      {
        id: 'ad1',
        title: 'Special Offer',
        description: 'Get 50% off on premium features',
        imageUrl: 'https://via.placeholder.com/400x120/FF9500/FFFFFF?text=Special+Offer',
        actionUrl: 'https://example.com/offer',
        type: 'banner',
      },
    ];

    // Mock notifications
    const mockNotifications: Notification[] = [
      {
        id: 'notif1',
        title: 'Welcome to Haritage!',
        message: 'Thanks for joining our community. Start exploring amazing content!',
        type: 'success',
        isRead: false,
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
        actionUrl: '/welcome',
      },
    ];

    // Add mock data to stores
    useFeedStore.getState().setItems(mockFeedItems);
    mockNotifications.forEach(notification => addNotification(notification));
  };

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

  const handleAdDismiss = (adId: string) => {
    console.log('Dismissed ad:', adId);
  };

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

  const renderAd = ({ item }: { item: AdItem }) => (
    <AdBanner
      ad={item}
      onPress={handleAdPress}
      onDismiss={handleAdDismiss}
    />
  );

  const renderHeader = () => (
    <View>
      <UserInfoBlock />
      <AdBanner
        ad={{
          id: 'header-ad',
          title: 'Welcome to Haritage',
          description: 'Discover amazing content and connect with others',
          imageUrl: 'https://via.placeholder.com/400x120/007AFF/FFFFFF?text=Welcome',
          actionUrl: '/welcome',
          type: 'banner',
        }}
        onPress={handleAdPress}
      />
    </View>
  );

  if (!isAuthenticated) {
    return null; // This should be handled by navigation
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={feedItems}
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
        style={styles.feedList}
      />

      {/* Notification Bell */}
      <NotificationBell
        onPress={() => setShowNotificationCenter(true)}
        size={28}
        color="#007AFF"
      />

      {/* Notification Center Modal */}
      <NotificationCenter
        isVisible={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />
    </View>
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
});
