/**
 * MyFeedsScreen
 * Display all feed items created by the current user
 * Allows viewing, editing, hiding, and deleting posts
 */

import { useFeedStore } from '@/core/store/slices/feedSlice';
import { MOCK_CURRENT_USER_ID } from '@/modules/feed/data/mockUserFeedData';
import { userFeedService } from '@/modules/feed/services/userFeedService';
import { FeedItem as FeedItemType } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ManageableFeedItem } from '../components/ManageableFeedItem';

export const MyFeedsScreen: React.FC = () => {
  const router = useRouter();
  const [userPosts, setUserPosts] = useState<FeedItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [stats, setStats] = useState({
    totalPosts: 0,
    hiddenPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
  });
  const { updateItem, removeItem } = useFeedStore();

  const loadUserPosts = useCallback(async () => {
    try {
      const posts = await userFeedService.getUserFeedItems(showHidden);
      const userStats = await userFeedService.getUserFeedStats();
      setUserPosts(posts);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading user posts:', error);
      Alert.alert('Error', 'Failed to load your posts');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [showHidden]);

  useEffect(() => {
    loadUserPosts();
  }, [loadUserPosts]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadUserPosts();
  }, [loadUserPosts]);

  const handleEdit = useCallback(
    (id: string) => {
      // Navigate to edit screen (to be implemented)
      Alert.alert('Edit Post', `Edit post ${id}`);
    },
    [],
  );

  const handleHide = useCallback(
    async (id: string) => {
      try {
        await userFeedService.hideFeedItem(id);
        updateItem(id, { isHidden: true });
        await loadUserPosts();
        Alert.alert('Success', 'Post hidden successfully');
      } catch (error) {
        console.error('Error hiding post:', error);
        Alert.alert('Error', 'Failed to hide post');
      }
    },
    [updateItem, loadUserPosts],
  );

  const handleUnhide = useCallback(
    async (id: string) => {
      try {
        await userFeedService.unhideFeedItem(id);
        updateItem(id, { isHidden: false });
        await loadUserPosts();
        Alert.alert('Success', 'Post unhidden successfully');
      } catch (error) {
        console.error('Error unhiding post:', error);
        Alert.alert('Error', 'Failed to unhide post');
      }
    },
    [updateItem, loadUserPosts],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await userFeedService.deleteFeedItem(id);
        removeItem(id);
        await loadUserPosts();
        Alert.alert('Success', 'Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        Alert.alert('Error', 'Failed to delete post');
      }
    },
    [removeItem, loadUserPosts],
  );

  const handleLike = useCallback((id: string) => {
    console.log('Like post:', id);
  }, []);

  const handleComment = useCallback((id: string) => {
    console.log('Comment on post:', id);
  }, []);

  const handleShare = useCallback((id: string) => {
    console.log('Share post:', id);
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#e4e6eb" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>My Posts</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.totalPosts}</Text>
        <Text style={styles.statLabel}>Posts</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.totalLikes}</Text>
        <Text style={styles.statLabel}>Likes</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.totalComments}</Text>
        <Text style={styles.statLabel}>Comments</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.totalShares}</Text>
        <Text style={styles.statLabel}>Shares</Text>
      </View>
    </View>
  );

  const renderFilterToggle = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowHidden(!showHidden)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={showHidden ? 'eye' : 'eye-off'}
          size={18}
          color={showHidden ? '#27ae60' : '#818384'}
        />
        <Text style={styles.filterText}>
          {showHidden ? 'Showing Hidden' : 'Hide Hidden'} ({stats.hiddenPosts})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#4a4b4c" />
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptyMessage}>
        Start sharing your moments with the community
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: FeedItemType }) => (
    <ManageableFeedItem
      item={item}
      isActive={false}
      currentUserId={MOCK_CURRENT_USER_ID}
      onLike={handleLike}
      onComment={handleComment}
      onShare={handleShare}
      onEdit={handleEdit}
      onHide={handleHide}
      onUnhide={handleUnhide}
      onDelete={handleDelete}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a66c2" />
          <Text style={styles.loadingText}>Loading your posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      {renderStats()}
      {renderFilterToggle()}

      <FlatList
        data={userPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0a66c2"
            colors={['#0a66c2']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#272729',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3b3c',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f0f0f3',
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#272729',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3a3b3c',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f0f0f3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#818384',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#3a3b3c',
    marginHorizontal: 8,
  },
  filterContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#272729',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3b3c',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e4e6eb',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e4e6eb',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#818384',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#818384',
  },
});
