import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VideoPlayer } from './VideoPlayer';
import { FeedItem as FeedItemType } from '@/shared/types';
import { useFeedStore } from '@/core/store/slices/feedSlice';

interface FeedItemProps {
  item: FeedItemType;
  isActive: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const FeedItem: React.FC<FeedItemProps> = ({
  item,
  isActive,
  onLike,
  onComment,
  onShare,
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const { updateItem } = useFeedStore();

  const handleLike = () => {
    const newLikes = item.isLiked ? item.likes - 1 : item.likes + 1;
    updateItem(item.id, {
      isLiked: !item.isLiked,
      likes: newLikes,
    });
    onLike(item.id);
  };

  const handleComment = () => {
    onComment(item.id);
  };

  const handleShare = () => {
    onShare(item.id);
  };

  const toggleTextExpansion = () => {
    setShowFullText(!showFullText);
  };

  const renderContent = () => {
    switch (item.type) {
      case 'video':
        return (
          <VideoPlayer
            videoUrl={item.videoUrl!}
            thumbnail={item.thumbnail}
            isActive={isActive}
            onError={(error) => Alert.alert('Video Error', error)}
          />
        );
      case 'image':
        return (
          <Image
            source={{ uri: item.content }}
            style={styles.imageContent}
            resizeMode="cover"
          />
        );
      case 'text':
        return (
          <View style={styles.textContent}>
            <Text style={styles.textContentText}>{item.content}</Text>
          </View>
        );
      default:
        return null;
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Image
            source={{ uri: item.author.avatar }}
            style={styles.avatar}
          />
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{item.author.name}</Text>
            <Text style={styles.timestamp}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Description */}
      {item.type !== 'text' && (
        <View style={styles.description}>
          <Text
            style={styles.descriptionText}
            numberOfLines={showFullText ? undefined : 3}
            onPress={toggleTextExpansion}
          >
            {item.content}
          </Text>
          {item.content.length > 100 && (
            <TouchableOpacity onPress={toggleTextExpansion}>
              <Text style={styles.readMoreText}>
                {showFullText ? 'Show less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
        >
          <Ionicons
            name={item.isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={item.isLiked ? '#FF3B30' : '#666'}
          />
          <Text style={[styles.actionText, item.isLiked && styles.likedText]}>
            {item.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleComment}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color="#666" />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moreButton: {
    padding: 5,
  },
  content: {
    backgroundColor: '#000',
  },
  imageContent: {
    width: screenWidth,
    height: screenWidth * 0.75, // 4:3 aspect ratio
  },
  textContent: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  textContentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  description: {
    padding: 15,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  readMoreText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  likedText: {
    color: '#FF3B30',
  },
});
