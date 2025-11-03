import { useFeedStore } from '@/core/store/slices/feedSlice';
import { useNotificationStore } from '@/core/store/slices/notificationSlice';
import { Radii, Spacing, Typography } from '@/core/config/theme';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { FeedItem } from '@/modules/feed/components/FeedItem';
import { CommentsScreen } from '@/modules/feed/screens/CommentsScreen';
import { useAppTheme } from '@/shared/hooks';
import { feedStorageService } from '@/shared/services/storage/feedStorageService';
import { FeedItem as FeedItemType } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const [activeFilter, setActiveFilter] = useState<string>('forYou');
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const numberLocale = useMemo(() => (i18n.language === 'vi' ? 'vi-VN' : 'en-US'), [i18n.language]);

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

  const filterChips = useMemo(
    () => [
      { id: 'forYou', label: t('home.filters.forYou') },
      { id: 'nearby', label: t('home.filters.nearby') },
      { id: 'popular', label: t('home.filters.popular') },
      { id: 'following', label: t('home.filters.following') },
    ],
    [t]
  );

  const loadFeedData = useCallback(async () => {
    try {
      const seededItems = await feedStorageService.ensureFeedItems();
      useFeedStore.getState().setItems(seededItems);

      addNotification({
        id: 'notif1',
        title: t('home.notifications.welcomeTitle'),
        message: t('home.notifications.welcomeMessage'),
        type: 'success',
        isRead: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error loading feed data:', error);
    }
  }, [addNotification, t]);

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
    Alert.alert(t('home.alerts.shareTitle'), t('home.alerts.shareBody'));
  }, [t]);

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
        <RNText style={styles.headerTitle}>{t('home.header.title')}</RNText>
        <TouchableOpacity
          style={styles.composeButton}
          onPress={handleComposePress}
          accessibilityRole="button"
          accessibilityLabel={t('home.header.composeAccessibility')}
        >
          <Ionicons name="create-outline" size={16} color="#ffffff" />
          <RNText style={styles.composeLabel}>{t('home.header.composeLabel')}</RNText>
        </TouchableOpacity>
      </View>
      <RNText style={styles.headerSubtitle}>{t('home.header.subtitle')}</RNText>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Ionicons name="albums-outline" size={18} color={colors.accent} />
          <View style={styles.statContent}>
            <RNText style={styles.statValue}>{feedStats.postCount.toLocaleString(numberLocale)}</RNText>
            <RNText style={styles.statLabel}>{t('home.stats.posts')}</RNText>
          </View>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="thumbs-up-outline" size={18} color={colors.accent} />
          <View style={styles.statContent}>
            <RNText style={styles.statValue}>{feedStats.totalLikes.toLocaleString(numberLocale)}</RNText>
            <RNText style={styles.statLabel}>{t('home.stats.appreciations')}</RNText>
          </View>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.accent} />
          <View style={styles.statContent}>
            <RNText style={styles.statValue}>{feedStats.totalComments.toLocaleString(numberLocale)}</RNText>
            <RNText style={styles.statLabel}>{t('home.stats.conversations')}</RNText>
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
          const isActive = chip.id === activeFilter;
          return (
            <TouchableOpacity
              key={chip.id}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(chip.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <RNText
                style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
              >
                {chip.label}
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
      paddingBottom: 100,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: Spacing.md,
      paddingBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      gap: Spacing.md,
      backgroundColor: colors.background,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: Typography.size.xxxl,
      lineHeight: Typography.lineHeight.xxxl,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.tight,
    },
    headerSubtitle: {
      fontSize: Typography.size.sm,
      lineHeight: Typography.lineHeight.sm,
      color: colors.textMuted,
    },
    composeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Radii.pill,
      backgroundColor: colors.accent,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    composeLabel: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
      color: '#ffffff',
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: Spacing.sm,
    },
    statCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderRadius: Radii.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadowSubtle,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    statContent: {
      flex: 1,
      gap: 2,
    },
    statValue: {
      fontSize: Typography.size.lg,
      lineHeight: Typography.lineHeight.lg,
      fontWeight: Typography.weight.bold,
      flexGrow: 1,
      color: colors.text,
    },
    statLabel: {
      fontSize: Typography.size.xs,
      lineHeight: Typography.lineHeight.xs,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: Typography.letterSpacing.wide,
    },
    filterScroll: {
      marginTop: Spacing.xs,
    },
    filterContent: {
      paddingRight: Spacing.md,
      gap: Spacing.sm,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Radii.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    filterChipActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    filterChipText: {
      fontSize: Typography.size.sm,
      lineHeight: Typography.lineHeight.sm,
      color: colors.text,
      fontWeight: Typography.weight.medium,
    },
    filterChipTextActive: {
      color: '#ffffff',
      fontWeight: Typography.weight.semibold,
    },
    fab: {
      position: 'absolute',
      right: Spacing.lg,
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
      elevation: 6,
      shadowColor: colors.shadow,
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    footerSpace: {
      height: Spacing.xxxl,
    },
  });

export default HomeScreen;