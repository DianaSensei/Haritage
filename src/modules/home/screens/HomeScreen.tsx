import { useFeedStore } from '@/core/store/slices/feedSlice';
import { useNotificationStore } from '@/core/store/slices/notificationSlice';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { FeedItem } from '@/modules/feed/components/FeedItem';
import { CommentsScreen } from '@/modules/feed/screens/CommentsScreen';
import { useAppTheme } from '@/shared/hooks';
import { feedStorageService } from '@/shared/services/storage/feedStorageService';
import { FeedItem as FeedItemType } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text as RNText, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';

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
  } = useFeedStore();
  const { addNotification } = useNotificationStore();

  const [currentVideoIndex, setCurrentVideoIndex] = useState<number | null>(null);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);
  const [activeFilter, setActiveFilter] = useState<string>('For you');
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
      const seededItems = await feedStorageService.ensureFeedItems();
      useFeedStore.getState().setItems(seededItems);

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
    await refreshFeed();
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
    setSelectedPostId(id);
    setCommentsModalVisible(true);
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
          <Ionicons name="albums-outline" size={18} color={colors.accent} />
          <View style={styles.statContent}>
            <RNText style={styles.statValue}>{feedStats.postCount.toLocaleString()}</RNText>
            <RNText style={styles.statLabel}>Posts</RNText>
          </View>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="thumbs-up-outline" size={18} color={colors.accent} />
          <View style={styles.statContent}>
            <RNText style={styles.statValue}>{feedStats.totalLikes.toLocaleString()}</RNText>
            <RNText style={styles.statLabel}>Appreciations</RNText>
          </View>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.accent} />
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
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.surface}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={styles.feedList}
      />
      {/* Comments Modal */}
      <CommentsScreen
        visible={commentsModalVisible}
        postId={selectedPostId}
        onClose={() => setCommentsModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    feedList: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 120,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 12,
      paddingBottom: 20,
      paddingHorizontal: 20,
      gap: 16,
      backgroundColor: colors.background,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
    },
    composeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: colors.accent,
      shadowColor: colors.accent,
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
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
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
      flexGrow: 1,
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
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
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    filterChipActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    filterChipText: {
      fontSize: 13,
      color: colors.text,
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
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: colors.accent,
      shadowOpacity: 0.4,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    footerSpace: {
      height: 48,
    },
  });

export default HomeScreen;