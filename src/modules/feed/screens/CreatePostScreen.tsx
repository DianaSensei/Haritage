import { useAuthStore } from '@/core/store/slices/authSlice';
import { useFeedStore } from '@/core/store/slices/feedSlice';
import { mediaService } from '@/modules/feed/services/mediaService';
import { postService } from '@/modules/feed/services/postService';
import { FileUpload } from '@/shared/services/api/client';
import { FeedItem } from '@/shared/types';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { SafeAreaView } from 'react-native-safe-area-context';

export const CreatePostScreen: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { addItems } = useFeedStore();

  const [title, setTitle] = useState('');
  const richTextRef = useRef<RichEditor>(null);
  const [content, setContent] = useState(''); // HTML rich text
  const [tags, setTags] = useState(''); // comma separated
  const [media, setMedia] = useState<FileUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickMedia = async (mediaTypes: 'images' | 'videos' | 'livePhotos', insertToEditor: boolean = false) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissions required', 'Please allow photo library access.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      // result can be single asset or an array depending on platform
      const assets: any[] = (result as any).selected ?? (result as any).assets ?? [result as any];

      const picked: FileUpload[] = assets.map((a, idx) => ({
        uri: a.uri,
        name: a.fileName || `media_${Date.now()}_${idx}`,
        type: a.type === 'video' ? (a.mimeType || 'video/mp4') : (a.mimeType || 'image/jpeg'),
      }));

      setMedia((m) => [...m, ...picked]);

      if (insertToEditor && assets.length > 0) {
        // Insert each image into the rich editor (videos are skipped for in-editor insertion)
        for (const a of assets) {
          if (a.type === 'image' && richTextRef.current) {
            try {
              richTextRef.current.insertImage(a.uri);
            } catch (e) {
              console.warn('insertImage failed', e);
            }
          }
        }
      }
    } catch (e) {
      console.warn('pickMedia', e);
      Alert.alert('Error', 'Unable to pick media.');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>You must be logged in to create a post.</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!title.trim() && !content.trim() && media.length === 0) {
      Alert.alert('Validation', 'Please add some text or media to create a post.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Optionally compress images here via mediaService.compressImage
      const uploaded = media.length > 0
        ? await mediaService.uploadMultipleMedia(media)
        : [];

      // Create post via postService
      const tagsArr = tags.split(',').map(t => t.trim()).filter(Boolean);
      const created = await postService.createPost({
        title: title.trim(),
        content: content.trim(),
        tags: tagsArr,
        media: uploaded,
      });

      // Optimistically add to feed store
      const newItem: FeedItem = {
        id: created.postId || `local-${Date.now()}`,
        type: uploaded.length > 0 && uploaded[0].type === 'video' ? 'video' : (uploaded.length > 0 ? 'image' : 'text'),
        content: content || (uploaded[0]?.url ?? ''),
        thumbnail: uploaded[0]?.thumbnail,
        videoUrl: uploaded.find(m => m.type === 'video')?.url,
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
      setContent('');
      setTags('');
      setMedia([]);

      Alert.alert('Success', 'Post created successfully.');
    } catch (err: any) {
      console.warn('create post error', err);
      Alert.alert('Error', err?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Enter a short title" style={styles.input} />

        <Text style={styles.label}>Content</Text>
        <View style={styles.richEditorContainer}>
          <RichEditor
            ref={richTextRef}
            initialContentHTML={content}
            onChange={setContent}
            placeholder="Write something beautiful..."
            style={styles.richInput}
            editorStyle={{ backgroundColor: '#fff', color: '#000' }}
            scrollEnabled={false}
          />

          <RichToolbar
            editor={richTextRef}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.insertLink,
              actions.insertImage,
              actions.insertVideo,
            ]}
            onPressAddImage={() => pickMedia('images', true)}
            onPressAddVideo={() => pickMedia('videos', false)}
            iconMap={{}}
            style={styles.richToolbar}
          />
        </View>

        <Text style={styles.label}>Tags (comma separated)</Text>
        <TextInput value={tags} onChangeText={setTags} placeholder="tag1, tag2" style={styles.input} />

        {media.length > 0 && (
          <>
            <Text style={styles.label}>Selected Media</Text>
            <View style={styles.previewRow}>
              {media.map((m, i) => (
                <View key={`${m.uri}-${i}`} style={styles.previewItem}>
                  <Image source={{ uri: m.uri }} style={styles.previewImage} />
                  {m.type.startsWith('video/') && (
                    <View style={styles.videoOverlay}>
                      <Text style={styles.videoIcon}>▶️</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.removeButton} onPress={() => setMedia(media.filter((_, idx) => idx !== i))}>
                    <Text style={styles.removeText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Create Post</Text>}
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 8, padding: 12, marginBottom: 12 },
  richInput: { minHeight: 60 },
  richEditorContainer: { marginBottom: 25, borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 8 },
  richToolbar: { marginTop: 8 },
  editorButtonsRow: { flexDirection: 'row', marginTop: 8 },
  toolbar: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  toolButton: { padding: 8, borderRadius: 6, backgroundColor: '#f5f5f5' },
  toolText: { fontWeight: '700' },
  mediaButtonsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  mediaButton: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginRight: 8 },
  mediaButtonText: { color: '#fff', fontWeight: '600' },
  previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  previewItem: { width: 100, height: 100, marginRight: 8, marginBottom: 8 },
  previewImage: { width: '100%', height: '100%', borderRadius: 8 },
  videoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  videoIcon: { fontSize: 24 },
  removeButton: { position: 'absolute', top: 4, right: 4, backgroundColor: '#FF3B30', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  removeText: { color: '#fff', fontSize: 16, lineHeight: 16 },
  submitButton: { backgroundColor: '#007AFF', paddingVertical: 14, borderRadius: 10, marginTop: 18, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  info: { color: '#333' },
  safeArea: { flex: 1, backgroundColor: '#fff' },
});

export default CreatePostScreen;
