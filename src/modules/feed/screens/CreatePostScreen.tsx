import { useAuthStore } from '@/core/store/slices/authSlice';
import { useFeedStore } from '@/core/store/slices/feedSlice';
import { mediaService } from '@/modules/feed/services/mediaService';
import { postService } from '@/modules/feed/services/postService';
import { FileUpload } from '@/shared/services/api/client';
import { FeedItem } from '@/shared/types';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Block {
  id: string;
  type: 'text' | 'image' | 'video';
  content: string;
  metadata?: { uri: string; duration?: number; size?: number };
}

export const CreatePostScreen: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { addItems } = useFeedStore();

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([{ id: '0', type: 'text', content: '' }]);
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addBlock = (type: 'text' | 'image' | 'video', afterId: string) => {
    const newBlock: Block = {
      id: `${Date.now()}`,
      type,
      content: '',
    };
    const index = blocks.findIndex(b => b.id === afterId);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const removeBlock = (id: string) => {
    if (blocks.length === 1) {
      Alert.alert('Validation', 'At least one block is required.');
      return;
    }
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const pickMedia = async (type: 'images' | 'videos', afterId: string) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissions required', 'Please allow photo library access.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const mediaBlock: Block = {
        id: `${Date.now()}`,
        type: type === 'images' ? 'image' : 'video',
        content: asset.uri,
        metadata: {
          uri: asset.uri,
          size: asset.fileSize || undefined,
          duration: asset.duration || undefined,
        },
      };

      const index = blocks.findIndex(b => b.id === afterId);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, mediaBlock);
      setBlocks(newBlocks);
    } catch (e) {
      console.warn('pickMedia error', e);
      Alert.alert('Error', 'Unable to pick media.');
    }
  };

  const handleSubmit = async () => {
    const hasContent = title.trim() || blocks.some(b => b.content.trim());
    
    if (!hasContent) {
      Alert.alert('Validation', 'Please add a title and at least one content block.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Collect media files to upload
      const mediaFiles: FileUpload[] = blocks
        .filter(b => (b.type === 'image' || b.type === 'video') && b.metadata?.uri)
        .map((b, idx) => ({
          uri: b.metadata!.uri,
          name: `media_${Date.now()}_${idx}`,
          type: b.type === 'image' ? 'image/jpeg' : 'video/mp4',
        }));

      // Upload media if any
      const uploaded = mediaFiles.length > 0
        ? await mediaService.uploadMultipleMedia(mediaFiles)
        : [];

      // Get text content from all text blocks
      const textContent = blocks
        .filter(b => b.type === 'text')
        .map(b => b.content.trim())
        .filter(Boolean)
        .join('\n\n');

      // Create post via postService
      const tagsArr = tags.split(',').map(t => t.trim()).filter(Boolean);
      const created = await postService.createPost({
        title: title.trim(),
        content: textContent,
        tags: tagsArr,
        media: uploaded,
      });

      // Optimistically add to feed store
      const firstMedia = uploaded[0];
      const newItem: FeedItem = {
        id: created.postId || `local-${Date.now()}`,
        type: firstMedia 
          ? (firstMedia.type === 'video' ? 'video' : 'image')
          : 'text',
        content: textContent || title,
        thumbnail: firstMedia?.thumbnail,
        videoUrl: firstMedia?.type === 'video' ? firstMedia.url : undefined,
        author: {
          id: String(user?.id ?? '0'),
          name: user?.name ?? 'You',
          avatar: user?.avatar ?? '',
        },
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        createdAt: new Date(),
      };

      addItems([newItem]);

      // Reset form
      setTitle('');
      setBlocks([{ id: '0', type: 'text', content: '' }]);
      setTags('');

      Alert.alert('Success', 'Post created successfully.');
    } catch (err: any) {
      console.warn('create post error', err);
      Alert.alert('Error', err?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>You must be logged in to create a post.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Title</Text>
          <TextInput 
            value={title} 
            onChangeText={setTitle} 
            placeholder="Enter a title for your post" 
            style={styles.input}
            maxLength={100}
          />

          <Text style={styles.sectionLabel}>Content Blocks</Text>
          
          {blocks.map((block, index) => (
            <View key={block.id} style={styles.blockWrapper}>
              {block.type === 'text' && (
                <>
                  <TextInput
                    value={block.content}
                    onChangeText={(text) => updateBlockContent(block.id, text)}
                    placeholder={`Paragraph ${blocks.filter(b => b.type === 'text').indexOf(block) + 1}`}
                    style={styles.textBlock}
                    multiline
                    numberOfLines={4}
                  />
                </>
              )}

              {block.type === 'image' && (
                <View style={styles.mediaContainer}>
                  <Image source={{ uri: block.content }} style={styles.mediaPreview} />
                  <Text style={styles.mediaLabel}>Image</Text>
                </View>
              )}

              {block.type === 'video' && (
                <View style={styles.mediaContainer}>
                  <View style={styles.videoPreview}>
                    <Text style={styles.videoPlayIcon}>▶️</Text>
                    <Text style={styles.mediaLabel}>Video</Text>
                  </View>
                </View>
              )}

              <View style={styles.blockControls}>
                <TouchableOpacity 
                  style={styles.addBlockButton} 
                  onPress={() => addBlock('text', block.id)}
                >
                  <Text style={styles.addButtonText}>+ Text</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.addBlockButton} 
                  onPress={() => pickMedia('images', block.id)}
                >
                  <Text style={styles.addButtonText}>+ Image</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.addBlockButton} 
                  onPress={() => pickMedia('videos', block.id)}
                >
                  <Text style={styles.addButtonText}>+ Video</Text>
                </TouchableOpacity>
                {blocks.length > 1 && (
                  <TouchableOpacity 
                    style={[styles.addBlockButton, styles.deleteButton]} 
                    onPress={() => removeBlock(block.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <Text style={styles.label}>Tags (comma separated)</Text>
          <TextInput 
            value={tags} 
            onChangeText={setTags} 
            placeholder="e.g., travel, food, tech" 
            style={styles.input}
            maxLength={100}
          />

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Publish Post</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  contentContainer: { padding: 16, paddingBottom: 32 },
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  
  // Labels & inputs
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8, color: '#333' },
  sectionLabel: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 12, color: '#000' },
  input: { borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#fff', fontSize: 14 },
  
  // Block styles
  blockWrapper: { marginBottom: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e6e6e6', overflow: 'hidden' },
  textBlock: { padding: 12, fontSize: 14, lineHeight: 20, minHeight: 100, textAlignVertical: 'top', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  
  // Media styles
  mediaContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  mediaPreview: { width: '100%', height: 200, borderRadius: 4 },
  mediaLabel: { marginTop: 8, fontSize: 12, color: '#666', fontWeight: '500' },
  videoPreview: { width: 150, height: 150, backgroundColor: '#000', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  videoPlayIcon: { fontSize: 40, marginBottom: 8 },
  
  // Block controls
  blockControls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12 },
  addBlockButton: { flex: 1, minWidth: '45%', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#007AFF', borderRadius: 6, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  deleteButton: { backgroundColor: '#FF3B30' },
  deleteButtonText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  
  // Submit button
  submitButton: { backgroundColor: '#007AFF', paddingVertical: 14, borderRadius: 10, marginTop: 24, alignItems: 'center', marginBottom: 16 },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  
  // Misc
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  info: { color: '#333', fontSize: 16 },
});

export default CreatePostScreen;
