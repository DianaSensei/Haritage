import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/core/config';
import {
    allCommercialItems,
    mockStoreFronts,
} from '@/modules/commercial/data/mockStores';
import { CommercialSectionItem, StoreFront } from '@/modules/commercial/types';
import { ThemedText } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';

const normalize = (value: string) => value.trim().toLowerCase();

export const CommercialSearchScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const inputRef = useRef<TextInput | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const storeMap = useMemo(() => {
    const entries = mockStoreFronts.map((store) => [store.id, store] as const);
    return new Map<string, StoreFront>(entries);
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = normalize(searchQuery);
    if (!normalizedQuery) {
      return [];
    }

    return allCommercialItems.filter((item) => {
      const store = storeMap.get(item.storeId);
      const haystack = [
        item.name,
        item.subtitle,
        store?.name,
        ...(item.tags ?? []),
      ]
        .filter(Boolean)
        .map((value) => normalize(String(value)));

      return haystack.some((value) => value.includes(normalizedQuery));
    });
  }, [searchQuery, storeMap]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => clearTimeout(timeout);
  }, []);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleChangeText = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleClearQuery = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleSubmit = useCallback(() => {
    const normalizedQuery = searchQuery.trim();
    if (!normalizedQuery) {
      return;
    }

    setRecentSearches((prev) => {
      const next = [normalizedQuery, ...prev.filter((term) => term !== normalizedQuery)];
      return next.slice(0, 6);
    });
  }, [searchQuery]);

  const handleApplyRecent = useCallback((term: string) => {
    setSearchQuery(term);
  }, []);

  const handleClearRecents = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const handleOpenStore = useCallback(
    (storeId: string) => {
      router.push({ pathname: '/store-info', params: { storeId } });
    },
    [router],
  );

  const resultsLabel = useMemo(() => {
    if (!searchQuery.trim()) {
      return '';
    }

    return t('commercial.search.resultsFor', {
      count: results.length,
      query: searchQuery.trim(),
    });
  }, [results.length, searchQuery, t]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
        >
          <Ionicons name="arrow-back" size={18} color={colors.icon} />
        </TouchableOpacity>

        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={16} color={colors.iconMuted} />
          <TextInput
            ref={inputRef}
            value={searchQuery}
            onChangeText={handleChangeText}
            onSubmitEditing={handleSubmit}
            placeholder={t('commercial.searchPlaceholder')}
            placeholderTextColor={colors.iconMuted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearQuery}
              accessibilityRole="button"
              accessibilityLabel={t('commercial.search.clearAction')}
            >
              <Ionicons name="close" size={14} color={colors.icon} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {searchQuery.trim() ? (
          <View style={styles.resultsHeader}>
            <ThemedText style={styles.resultsLabel}>{resultsLabel}</ThemedText>
          </View>
        ) : (
          <View style={styles.placeholderBlock}>
            <ThemedText style={styles.placeholderTitle}>{t('commercial.search.title')}</ThemedText>
            <ThemedText style={styles.placeholderSubtitle}>
              {t('commercial.search.emptyPrompt')}
            </ThemedText>
          </View>
        )}

        {!searchQuery.trim() && recentSearches.length > 0 ? (
          <View style={styles.recentBlock}>
            <View style={styles.recentHeader}>
              <ThemedText style={styles.recentTitle}>{t('commercial.search.recentTitle')}</ThemedText>
              <TouchableOpacity onPress={handleClearRecents} accessibilityRole="button">
                <ThemedText style={styles.recentClear}>{t('commercial.search.clearAction')}</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.recentTags}>
              {recentSearches.map((term) => (
                <TouchableOpacity
                  key={term}
                  onPress={() => handleApplyRecent(term)}
                  style={styles.recentChip}
                  accessibilityRole="button"
                >
                  <ThemedText style={styles.recentChipLabel}>{term}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {searchQuery.trim() ? (
          results.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle" size={42} color={colors.iconMuted} />
              <ThemedText style={styles.emptyTitle}>
                {t('commercial.search.emptyResultsTitle')}
              </ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                {t('commercial.search.emptyResultsSubtitle')}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.resultsList}>
              {results.map((item) => {
                const store = storeMap.get(item.storeId);
                if (!store) {
                  return null;
                }

                return (
                  <SearchResultCard
                    key={item.id}
                    item={item}
                    store={store}
                    onPress={() => handleOpenStore(store.id)}
                    styles={styles}
                    colors={colors}
                  />
                );
              })}
            </View>
          )
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

interface SearchResultCardProps {
  item: CommercialSectionItem;
  store: StoreFront;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  colors: ReturnType<typeof useAppTheme>['colors'];
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ item, store, onPress, styles, colors }) => (
  <TouchableOpacity
    style={styles.resultCard}
    activeOpacity={0.88}
    accessibilityRole="button"
    onPress={onPress}
  >
    <View style={styles.resultMedia}>
      {item.imageUrl ? (
        <>
          <Image source={{ uri: item.imageUrl }} style={styles.resultImage} resizeMode="cover" />
          <View
            style={[styles.resultBadgeOverlay, { backgroundColor: item.accentColor }]}
            accessible={false}
          >
            <ThemedText style={styles.resultBadgeText}>{item.storeBadge}</ThemedText>
          </View>
        </>
      ) : (
        <View
          style={[styles.resultBadgeFallback, { backgroundColor: item.accentColor }]}
          accessible={false}
        >
          <ThemedText style={styles.resultBadgeText}>{item.storeBadge}</ThemedText>
        </View>
      )}
    </View>

    <View style={styles.resultBody}>
      <ThemedText style={styles.resultTitle} numberOfLines={2}>
        {item.name}
      </ThemedText>
      {item.subtitle ? (
        <ThemedText style={styles.resultSubtitle} numberOfLines={2}>
          {item.subtitle}
        </ThemedText>
      ) : null}

      <View style={styles.resultMetaRow}>
        <Ionicons name="storefront" size={12} color={colors.iconMuted} />
        <ThemedText style={styles.resultStore}>{store.name}</ThemedText>
        <View style={styles.metaDot} />
        <ThemedText style={styles.resultPrice}>{item.price}</ThemedText>
      </View>

      {item.tags?.length ? (
        <View style={styles.resultTags}>
          {item.tags.slice(0, 4).map((tag) => (
            <View key={tag} style={styles.resultTagChip}>
              <ThemedText style={styles.resultTagText}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      ) : null}
    </View>

    <Ionicons name="chevron-forward" size={16} color={colors.iconMuted} />
  </TouchableOpacity>
);

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 12,
      backgroundColor: colors.background,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    clearButton: {
      width: 28,
      height: 28,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSecondary,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 32,
      gap: 24,
    },
    placeholderBlock: {
      gap: 8,
    },
    placeholderTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      fontFamily: Fonts.sans,
    },
    placeholderSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
    },
    recentBlock: {
      gap: 12,
    },
    recentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    recentTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    recentClear: {
      fontSize: 13,
      color: colors.accentStrong,
    },
    recentTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    recentChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recentChipLabel: {
      fontSize: 13,
      color: colors.text,
    },
    resultsHeader: {
      gap: 6,
    },
    resultsLabel: {
      fontSize: 14,
      color: colors.textMuted,
    },
    resultsList: {
      gap: 14,
    },
    emptyState: {
      alignItems: 'center',
      gap: 12,
      paddingVertical: 80,
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
      paddingHorizontal: 12,
      lineHeight: 18,
    },
    resultCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 16,
      padding: 16,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
    resultMedia: {
      width: 78,
      alignItems: 'center',
    },
    resultImage: {
      width: 78,
      height: 78,
      borderRadius: 14,
    },
    resultBadgeOverlay: {
      position: 'absolute',
      bottom: -8,
      left: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultBadgeFallback: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultBadgeText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#0f1113',
    },
    resultBody: {
      flex: 1,
      gap: 8,
    },
    resultTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    resultSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    resultMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    resultStore: {
      fontSize: 12,
      color: colors.textMuted,
    },
    metaDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
    },
    resultPrice: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.accentStrong,
    },
    resultTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    resultTagChip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: colors.surfaceSecondary,
    },
    resultTagText: {
      fontSize: 11,
      color: colors.textMuted,
    },
  });

export default CommercialSearchScreen;
