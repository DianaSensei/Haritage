/**
 * EditFeedScreen
 * Screen for editing existing feed posts
 * Supports editing text, media, URLs, and polls
 */

import { MOCK_CURRENT_USER_ID } from '@/modules/feed/data/mockUserFeedData';
import { userFeedService } from '@/modules/feed/services/userFeedService';
import { FeedItem } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const EditFeedScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const postId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalPost, setOriginalPost] = useState<FeedItem | null>(null);

  // Editable fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>([]);

  const loadPost = useCallback(async () => {
    try {
      const post = await userFeedService.getUserFeedItem(postId);
      if (!post) {
        Alert.alert('Error', 'Post not found');
        router.back();
        return;
      }

      if (post.author.id !== MOCK_CURRENT_USER_ID) {
        Alert.alert('Error', 'You can only edit your own posts');
        router.back();
        return;
      }

      setOriginalPost(post);
      setTitle(post.title || '');
      setContent(post.content || '');
      setUrl(post.url || '');

      if (post.poll) {
        setPollQuestion(post.poll.question);
        setPollOptions(post.poll.options);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading post:', error);
      Alert.alert('Error', 'Failed to load post');
      router.back();
    }
  }, [postId, router]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Validation Error', 'Content cannot be empty');
      return;
    }

    setIsSaving(true);

    try {
      const updates: any = {
        id: postId,
        title: title.trim() || undefined,
        content: content.trim(),
        url: url.trim() || undefined,
      };

      // Update poll if it exists
      if (originalPost?.poll && pollQuestion.trim()) {
        const validOptions = pollOptions.filter((opt) => opt.trim());
        if (validOptions.length >= 2) {
          updates.poll = {
            question: pollQuestion.trim(),
            options: validOptions,
            closeHours: originalPost.poll.closeHours,
          };
        }
      }

      await userFeedService.editFeedItem(updates);

      Alert.alert('Success', 'Post updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error saving post:', error);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  };

  const hasChanges = () => {
    if (!originalPost) return false;

    return (
      (title.trim() || '') !== (originalPost.title || '') ||
      content.trim() !== originalPost.content ||
      (url.trim() || '') !== (originalPost.url || '') ||
      (originalPost.poll && pollQuestion.trim() !== originalPost.poll.question)
    );
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a66c2" />
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Post</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.headerButton, isSaving && styles.disabledButton]}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#0a66c2" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Title (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Add a title..."
            placeholderTextColor="#818384"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Content *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What's on your mind?"
            placeholderTextColor="#818384"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={5000}
          />
          <Text style={styles.characterCount}>{content.length} / 5000</Text>
        </View>

        {/* URL Input */}
        <View style={styles.section}>
          <Text style={styles.label}>URL (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com"
            placeholderTextColor="#818384"
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Poll Section */}
        {originalPost?.poll && (
          <View style={styles.section}>
            <Text style={styles.label}>Poll</Text>
            <TextInput
              style={styles.input}
              placeholder="Poll question"
              placeholderTextColor="#818384"
              value={pollQuestion}
              onChangeText={setPollQuestion}
              maxLength={200}
            />

            <View style={styles.pollOptionsContainer}>
              {pollOptions.map((option, index) => (
                <View key={index} style={styles.pollOptionRow}>
                  <TextInput
                    style={[styles.input, styles.pollOptionInput]}
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor="#818384"
                    value={option}
                    onChangeText={(text) => updatePollOption(index, text)}
                    maxLength={100}
                  />
                  {pollOptions.length > 2 && (
                    <TouchableOpacity
                      onPress={() => removePollOption(index)}
                      style={styles.removeOptionButton}
                    >
                      <Ionicons name="close-circle" size={24} color="#e74c3c" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {pollOptions.length < 6 && (
                <TouchableOpacity
                  style={styles.addOptionButton}
                  onPress={addPollOption}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#0a66c2" />
                  <Text style={styles.addOptionText}>Add Option</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Media Note */}
        {(originalPost?.mediaUris || originalPost?.videoUrl) && (
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#0a66c2" />
            <Text style={styles.noteText}>
              Media editing is not supported yet. To change media, delete this post and
              create a new one.
            </Text>
          </View>
        )}
      </ScrollView>
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
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 60,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelText: {
    fontSize: 16,
    color: '#818384',
    fontWeight: '500',
  },
  saveText: {
    fontSize: 16,
    color: '#0a66c2',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f0f0f3',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e4e6eb',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#272729',
    borderWidth: 1,
    borderColor: '#3a3b3c',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#e4e6eb',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  characterCount: {
    fontSize: 12,
    color: '#818384',
    textAlign: 'right',
  },
  pollOptionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pollOptionInput: {
    flex: 1,
  },
  removeOptionButton: {
    padding: 4,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#272729',
    borderWidth: 1,
    borderColor: '#0a66c2',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0a66c2',
  },
  noteContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: 'rgba(10, 102, 194, 0.1)',
    borderWidth: 1,
    borderColor: '#0a66c2',
    borderRadius: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#b1b2b6',
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
