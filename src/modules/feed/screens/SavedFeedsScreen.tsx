import { useFeedStore } from '@/core/store/slices/feedSlice';
import { ThemedText } from '@/shared/components';
import { SettingsHeader } from '@/shared/components/layout/SettingsHeader';
import { useAppTheme } from '@/shared/hooks';
import { feedStorageService } from '@/shared/services/storage/feedStorageService';
import { FeedItem } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    FlatList,
    GestureResponderEvent,
    Image,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const getPrimaryMedia = (item: FeedItem) => {
  if (item.thumbnail) {
    return { uri: item.thumbnail, type: 'image' as const };
  }

  const firstMedia = item.mediaUris?.[0];
  if (firstMedia) {
    const isVideo = /(\.(mp4|mov|m4v|webm|avi|mkv))$/i.test(firstMedia);
    return { uri: firstMedia, type: isVideo ? ('video' as const) : ('image' as const) };
  }

  if (item.videoUrl) {
    return { uri: item.videoUrl, type: 'video' as const };
  }

  return null;
};

export const SavedFeedsScreen: React.FC = () => {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { t, i18n } = useTranslation();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const feedItems = useFeedStore((state) => state.items);
  const setItems = useFeedStore((state) => state.setItems);
  const updateItem = useFeedStore((state) => state.updateItem);

  const [isLoading, setIsLoading] = useState(feedItems.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  const locale = useMemo(() => (i18n.language === 'vi' ? 'vi-VN' : 'en-US'), [i18n.language]);

  useEffect(() => {
    let isMounted = true;

    const loadFeed = async () => {
      try {
        const items = await feedStorageService.ensureFeedItems();
        if (isMounted) {
          setItems(items);
        }
      } catch (error) {
        console.warn('Failed to seed feed items for saved view', error);
        if (isMounted) {
          Alert.alert(t('savedFeeds.alerts.loadFailedTitle'), t('savedFeeds.alerts.loadFailedBody'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (feedItems.length === 0) {
      loadFeed();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [feedItems.length, setItems, t]);

  const savedItems = useMemo(
    () => feedItems.filter((item) => item.isSaved),
    [feedItems],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenItem = useCallback(
    (item: FeedItem) => {
      router.push({
        pathname: '/media-detail',
        params: { postId: item.id },
      });
    },
    [router],
  );

  const persistSavedState = useCallback(async (item: FeedItem, nextSaved: boolean) => {
    updateItem(item.id, { isSaved: nextSaved });
    try {
      await feedStorageService.updateFeedItem(item.id, { isSaved: nextSaved });
    } catch (error) {
      console.warn('Failed to persist saved toggle from saved list', error);
      updateItem(item.id, { isSaved: !nextSaved });
      Alert.alert(t('savedFeeds.alerts.syncFailedTitle'), t('savedFeeds.alerts.syncFailedBody'));
    }
  }, [t, updateItem]);

  const handleToggleSaved = useCallback(
    (item: FeedItem) => {
      const nextSaved = !(item.isSaved ?? false);
      void persistSavedState(item, nextSaved);
    },
    [persistSavedState],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const items = await feedStorageService.ensureFeedItems();
      setItems(items);
    } catch (error) {
      console.warn('Failed to refresh saved feed items', error);
      Alert.alert(t('savedFeeds.alerts.loadFailedTitle'), t('savedFeeds.alerts.loadFailedBody'));
    } finally {
      setRefreshing(false);
    }
  }, [setItems, t]);

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => {
      const previewTitle = item.title?.trim().length ? item.title.trim() : t('savedFeeds.item.untitled');
      const previewDescription = item.content?.trim().length
        ? item.content.trim()
        : t('savedFeeds.item.noDescription');
      const media = getPrimaryMedia(item);

      const handleItemPress = () => handleOpenItem(item);
      const handleUnsavePress = (event: GestureResponderEvent) => {
        event.stopPropagation?.();
        handleToggleSaved(item);
      };

      return (
        <TouchableOpacity
          style={styles.listItem}
          onPress={handleItemPress}
          activeOpacity={0.8}
        >
          <View style={styles.thumbnailContainer}>
            {media ? (
              <Image source={{ uri: media.uri }} style={styles.thumbnailImage} resizeMode="cover" />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <Ionicons name="bookmark-outline" size={20} color={colors.iconMuted} />
              </View>
            )}
            {media?.type === 'video' ? (
              <View style={styles.videoBadge}>
                <Ionicons name="videocam" size={12} color="#ffffff" />
              </View>
            ) : null}
          </View>

          <View style={styles.itemContent}>
            <ThemedText numberOfLines={1} style={styles.itemTitle}>
              {previewTitle}
            </ThemedText>
            <ThemedText numberOfLines={2} style={styles.itemDescription}>
              {previewDescription}
            </ThemedText>
            <View style={styles.itemMetaRow}>
              <View style={styles.itemMetaGroup}>
                <Ionicons name="heart" size={12} color={colors.iconMuted} />
                <ThemedText style={styles.itemMetaText}>{item.likes.toLocaleString(locale)}</ThemedText>
              </View>
              <View style={styles.itemMetaGroup}>
                <Ionicons name="chatbubble" size={12} color={colors.iconMuted} />
                <ThemedText style={styles.itemMetaText}>{item.comments.toLocaleString(locale)}</ThemedText>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.unsaveButton}
            onPress={handleUnsavePress}
            accessibilityRole="button"
            accessibilityLabel={t('savedFeeds.item.unsave')}
          >
            <Ionicons name="bookmark" size={20} color={colors.accent} />
          </TouchableOpacity>

          <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
        </TouchableOpacity>
      );
    },
    [colors.accent, colors.iconMuted, handleOpenItem, handleToggleSaved, locale, styles, t],
  );

  const savedCount = savedItems.length;
  const formattedCount = useMemo(
    () => savedCount.toLocaleString(locale),
    [locale, savedCount],
  );

  const summaryDescription = useMemo(
    () => t('savedFeeds.stats.count', { count: savedCount }),
    [savedCount, t],
  );
  const summaryLabel = useMemo(() => t('savedFeeds.stats.label'), [t]);
  const summaryCaption = useMemo(() => t('savedFeeds.stats.caption'), [t]);

  const listEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyState}>
        <Ionicons name="bookmark-outline" size={36} color={colors.iconMuted} />
        <ThemedText style={styles.emptyTitle}>{t('savedFeeds.empty.title')}</ThemedText>
        <ThemedText style={styles.emptySubtitle}>{t('savedFeeds.empty.subtitle')}</ThemedText>
      </View>
    ),
    [colors.iconMuted, styles.emptyState, styles.emptySubtitle, styles.emptyTitle, t],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <SettingsHeader
        title={t('savedFeeds.title')}
        onBack={handleBack}
        backAccessibilityLabel={t('common.goBack')}
      />

      <FlatList
        data={savedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.helperCard}>
              <Ionicons name="bookmark" size={18} color={colors.accent} />
              <View style={styles.helperTexts}>
                <ThemedText style={styles.helperTitle}>{t('savedFeeds.helper.title')}</ThemedText>
                <ThemedText style={styles.helperDescription}>{t('savedFeeds.helper.description')}</ThemedText>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryBadge}>
                <Ionicons name="bookmark" size={16} color={colors.accent} />
              </View>

              <View style={styles.summaryMetrics}>
                <ThemedText style={styles.summaryCount}>{formattedCount}</ThemedText>
                <ThemedText style={styles.summaryLabel}>{summaryLabel}</ThemedText>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryInfo}>
                <ThemedText style={styles.summaryDescription}>{summaryDescription}</ThemedText>
                <ThemedText style={styles.summaryCaption}>{summaryCaption}</ThemedText>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={!isLoading ? listEmptyComponent : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors'], isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 32,
      gap: 16,
    },
    headerContent: {
      gap: 16,
      marginBottom: 4,
    },
    helperCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderRadius: 16,
      backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    helperTexts: {
      flex: 1,
      gap: 4,
    },
    helperTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    helperDescription: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    summaryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderRadius: 18,
      backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 16,
    },
    summaryBadge: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentSoft,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    summaryMetrics: {
      gap: 4,
      minWidth: 80,
    },
    summaryCount: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
    },
    summaryLabel: {
      fontSize: 13,
      color: colors.textMuted,
    },
    summaryDivider: {
      width: 1,
      alignSelf: 'stretch',
      backgroundColor: colors.border,
      opacity: isDark ? 0.45 : 0.6,
      marginHorizontal: 12,
    },
    summaryInfo: {
      flex: 1,
      gap: 6,
    },
    summaryDescription: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    summaryCaption: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 18,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    thumbnailContainer: {
      width: 64,
      height: 64,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.surfaceTertiary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    thumbnailImage: {
      width: '100%',
      height: '100%',
    },
    thumbnailPlaceholder: {
      flex: 1,
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    videoBadge: {
      position: 'absolute',
      bottom: 6,
      right: 6,
      backgroundColor: 'rgba(0,0,0,0.65)',
      borderRadius: 8,
      paddingVertical: 2,
      paddingHorizontal: 6,
    },
    itemContent: {
      flex: 1,
      gap: 6,
    },
    itemTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    itemDescription: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    itemMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    itemMetaGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    itemMetaText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    unsaveButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyState: {
      marginTop: 64,
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    emptySubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
    },
  });

export default SavedFeedsScreen;
