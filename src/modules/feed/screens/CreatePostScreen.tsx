import { useAuthStore } from '@/core/store/slices/authSlice';
import { useFeedStore } from '@/core/store/slices/feedSlice';
import { FeedItem } from '@/shared/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PollOption {
  id: string;
  text: string;
}

interface Poll {
  question: string;
  options: PollOption[];
}

interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
}

export const CreatePostScreen: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { addItems } = useFeedStore();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [linkValidationError, setLinkValidationError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: 'image' | 'video' }[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [usedTags, setUsedTags] = useState<string[]>([]);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [pollCloseHours, setPollCloseHours] = useState('24');
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tagSuggestions = useMemo(() => {
    if (!tagInput.trim()) return [];
    const words = tagInput.split(/[^a-zA-Z0-9]+/);
    const lastWord = words[words.length - 1] || '';
    if (!lastWord || lastWord.length < 1) return [];
    return usedTags.filter(
      t =>
        t.toLowerCase().startsWith(lastWord.toLowerCase()) &&
        !selectedTags.map(st => st.toLowerCase()).includes(t.toLowerCase())
    );
  }, [tagInput, usedTags, selectedTags]);

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleTagInput = (text: string) => {
    setTagInput(text);
    const lastChar = text[text.length - 1];
    if (lastChar && !/[a-zA-Z0-9]/.test(lastChar)) {
      const words = text.split(/[^a-zA-Z0-9]+/).filter(Boolean);
      if (words.length > 0) {
        const lastWord = words[words.length - 1];
        if (lastWord && !selectedTags.map(t => t.toLowerCase()).includes(lastWord.toLowerCase())) {
          addTagToSelected(lastWord);
          setTagInput(''); // Clear input after tag is added
        }
      }
    }
  };

  const addTagToSelected = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (!cleanTag || selectedTags.map(t => t.toLowerCase()).includes(cleanTag)) return;
    setSelectedTags([...selectedTags, cleanTag]);
    if (!usedTags.map(t => t.toLowerCase()).includes(cleanTag)) {
      setUsedTags([...usedTags, cleanTag]);
    }
  };

  const addTag = (tag: string) => {
    addTagToSelected(tag);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const pickMedia = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissions required', 'Please allow photo library access.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      } as any);
      if (result.canceled || !result.assets) return;
      const added = result.assets.map(a => ({ uri: a.uri, type: (a.type === 'video' ? 'video' : 'image') as 'image' | 'video' }));
      setSelectedMedia(prev => [...prev, ...added]);
    } catch (e) {
      console.warn('pickMedia error', e);
      Alert.alert('Error', 'Unable to pick media.');
    }
  };

  const addPollOption = () => {
    if (!poll) return;
    if (poll.options.length < 4) {
      setPoll({ ...poll, options: [...poll.options, { id: `${Date.now()}`, text: '' }] });
    }
  };

  const removePollOption = (id: string) => {
    if (!poll || poll.options.length <= 2) return;
    setPoll({ ...poll, options: poll.options.filter(o => o.id !== id) });
  };

  const updatePollOption = (id: string, text: string) => {
    if (!poll) return;
    setPoll({ ...poll, options: poll.options.map(o => (o.id === id ? { ...o, text } : o)) });
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please add a title.');
      return;
    }
    const hasContent = body.trim() || selectedMedia.length > 0 || linkUrl.trim() || (poll && poll.question.trim());
    if (!hasContent) {
      Alert.alert('Validation', 'Please add at least one content type.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Create local post object
      const localPostId = `local-${Date.now()}`;
      const contentObj: any = {
        body: body.trim(),
        url: linkUrl.trim(),
        urlPreview: linkPreview,
        poll: poll ? { question: poll.question, options: poll.options.map(o => o.text), closeHours: parseInt(pollCloseHours) || 24 } : null,
      };

      // Save media locally if present
      const localMediaUris: string[] = [];
      if (selectedMedia.length > 0) {
        localMediaUris.push(...selectedMedia.map(m => m.uri));
      }

      // Create post data for local storage
      const postData = {
        id: localPostId,
        title: title.trim(),
        content: contentObj,
        tags: selectedTags,
        mediaUris: localMediaUris,
        author: { id: String(user?.id ?? '0'), name: user?.name ?? 'You', avatar: user?.avatar ?? '' },
        createdAt: new Date().toISOString(),
      };

      // Save to AsyncStorage
      const existingPosts = await AsyncStorage.getItem('drafts_posts');
      const posts = existingPosts ? JSON.parse(existingPosts) : [];
      posts.push(postData);
      await AsyncStorage.setItem('drafts_posts', JSON.stringify(posts));

      // Create feed item for optimistic update
      const newItem: FeedItem = {
        id: localPostId,
        type: selectedMedia[0] ? (selectedMedia[0].type === 'video' ? 'video' : 'image') : 'text',
        content: body.trim() || linkUrl.trim() || title,
        thumbnail: selectedMedia[0]?.uri,
        videoUrl: selectedMedia[0]?.type === 'video' ? selectedMedia[0].uri : undefined,
        author: { id: String(user?.id ?? '0'), name: user?.name ?? 'You', avatar: user?.avatar ?? '' },
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        createdAt: new Date(),
      };

      addItems([newItem]);

      // Reset form
      setTitle('');
      setBody('');
      setSelectedMedia([]);
      setLinkUrl('');
      setLinkPreview(null);
      setLinkValidationError('');
      setShowUrlInput(false);
      setSelectedTags([]);
      setTagInput('');
      setPoll(null);
      setPollCloseHours('24');
      setShowPollCreator(false);

      Alert.alert('Success', 'Post saved locally.');
      router.back();
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.postBtn, isSubmitting && styles.postBtnDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
            <Text style={styles.postBtnText}>{isSubmitting ? '...' : 'Post'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor="#666"
            style={styles.titleInput}
            maxLength={300}
          />
          <View style={styles.contentBox}>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="body text (optional)"
              placeholderTextColor="#666"
              style={styles.bodyInput}
              multiline
              textAlignVertical="top"
            />
            {showUrlInput && (
              <>
                <TextInput
                  value={linkUrl}
                  onChangeText={(url) => {
                    setLinkUrl(url);
                    if (url.trim()) {
                      if (!isValidUrl(url)) {
                        setLinkValidationError('Invalid URL format');
                      } else {
                        setLinkValidationError('');
                        setLinkPreview({ url, title: new URL(url).hostname, description: url });
                      }
                    }
                  }}
                  placeholder="Add URL (optional)"
                  placeholderTextColor="#666"
                  style={styles.urlInput}
                />
                {linkValidationError && <Text style={styles.errorMsg}>{linkValidationError}</Text>}
                {linkPreview && !linkValidationError && (
                  <View style={styles.previewBox}>
                    <Text style={styles.previewTitle} numberOfLines={1}>{linkPreview.title}</Text>
                    <Text style={styles.previewUrl} numberOfLines={1}>{linkPreview.url}</Text>
                  </View>
                )}
              </>
            )}
            {selectedMedia.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaGallery}>
                {selectedMedia.map((m, i) => (
                  <View key={`${m.uri}-${i}`} style={styles.mediaBox}>
                    <Image source={{ uri: m.uri }} style={styles.mediaThumbnail} />
                    <TouchableOpacity style={styles.mediaBadge} onPress={() => setSelectedMedia(prev => prev.filter((_, idx) => idx !== i))}>
                      <Text style={styles.mediaBadgeText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <View style={styles.tagsBox}>
              {selectedTags.length > 0 && (
                <View style={styles.tagsList}>
                  {selectedTags.map((tag, idx) => (
                    <TouchableOpacity key={`${tag}-${idx}`} style={styles.tag} onPress={() => removeTag(tag)}>
                      <Text style={styles.tagText}>{tag} ✕</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TextInput
                value={tagInput}
                onChangeText={handleTagInput}
                placeholder="Add tags... (space ends tag)"
                placeholderTextColor="#999"
                style={styles.tagInput}
              />
              {tagSuggestions.length > 0 && (
                <View style={styles.tagSuggestions}>
                  {tagSuggestions.slice(0, 5).map((tag) => (
                    <TouchableOpacity key={tag} style={styles.tagSuggestion} onPress={() => addTag(tag)}>
                      <Text style={styles.tagSuggestionText}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            {showPollCreator && (
              <View style={styles.pollBox}>
                <TextInput
                  value={poll?.question || ''}
                  onChangeText={(text) => {
                    if (!poll) setPoll({ question: text, options: [{ id: '1', text: '' }, { id: '2', text: '' }] });
                    else setPoll({ ...poll, question: text });
                  }}
                  placeholder="Poll question"
                  placeholderTextColor="#666"
                  style={styles.pollQuestion}
                />
                {poll && (
                  <>
                    <View style={styles.pollOptionsList}>
                      {poll.options.map((opt, idx) => (
                        <View key={opt.id} style={styles.pollOptionRow}>
                          <TextInput
                            value={opt.text}
                            onChangeText={(text) => updatePollOption(opt.id, text)}
                            placeholder={`Option ${idx + 1}`}
                            placeholderTextColor="#999"
                            style={styles.pollOptionText}
                          />
                          {poll.options.length > 2 && (
                            <TouchableOpacity style={styles.pollRemove} onPress={() => removePollOption(opt.id)}>
                              <Text style={styles.pollRemoveText}>✕</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                    {poll.options.length < 4 && (
                      <TouchableOpacity style={styles.addOption} onPress={addPollOption}>
                        <Text style={styles.addOptionText}>+ Add option</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
                <TextInput
                  value={pollCloseHours}
                  onChangeText={setPollCloseHours}
                  placeholder="24"
                  placeholderTextColor="#999"
                  style={styles.pollClose}
                  keyboardType="number-pad"
                />
              </View>
            )}
          </View>
        </ScrollView>
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={[styles.toolBtn, showUrlInput && styles.toolBtnActive]}
            onPress={() => {
              setShowUrlInput(!showUrlInput);
              if (showUrlInput) {
                setLinkUrl('');
                setLinkPreview(null);
                setLinkValidationError('');
              }
            }}
          >
            <Text style={styles.toolIcon}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={pickMedia}>
            <Text style={styles.toolIcon}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, showPollCreator && styles.toolBtnActive]}
            onPress={() => {
              setShowPollCreator(!showPollCreator);
              if (!showPollCreator && !poll) setPoll({ question: '', options: [{ id: '1', text: '' }, { id: '2', text: '' }] });
            }}
          >
            <Text style={styles.toolIcon}>•</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a1a1b' },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  info: { color: '#fff', fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#343536', backgroundColor: '#1a1a1b' },
  close: { fontSize: 24, color: '#818384', fontWeight: '700' },
  postBtn: { paddingHorizontal: 18, paddingVertical: 8, backgroundColor: '#0a66c2', borderRadius: 20 },
  postBtnDisabled: { opacity: 0.5 },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  scrollContent: { flex: 1, paddingHorizontal: 16, paddingVertical: 12 },
  titleInput: { color: '#e4e6eb', fontSize: 24, fontWeight: '700', marginVertical: 8, padding: 12, backgroundColor: '#272729', borderRadius: 8, borderWidth: 1, borderColor: '#404142', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  contentBox: { flex: 1, marginVertical: 8 },
  bodyInput: { color: '#e4e6eb', fontSize: 16, flex: 1, padding: 12, minHeight: 120, backgroundColor: '#272729', borderRadius: 8, borderWidth: 1, borderColor: '#404142', marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  urlInput: { color: '#e4e6eb', fontSize: 14, marginTop: 8, padding: 12, backgroundColor: '#272729', borderRadius: 8, borderWidth: 1, borderColor: '#404142', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  errorMsg: { color: '#ff4500', fontSize: 12, marginTop: 4 },
  previewBox: { marginTop: 8, padding: 12, backgroundColor: '#272729', borderRadius: 8, borderWidth: 1, borderColor: '#404142', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  previewTitle: { color: '#e4e6eb', fontWeight: '600', fontSize: 13, marginBottom: 4 },
  previewUrl: { color: '#818384', fontSize: 11 },
  mediaGallery: { marginTop: 8, marginHorizontal: -16, paddingHorizontal: 16, paddingVertical: 8 },
  mediaBox: { position: 'relative', marginRight: 12 },
  mediaThumbnail: { width: 100, height: 100, borderRadius: 8, backgroundColor: '#343536', borderWidth: 1, borderColor: '#404142', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  mediaBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.8)', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  mediaBadgeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  tagsBox: { marginTop: 8, padding: 12, backgroundColor: '#272729', borderRadius: 8, borderWidth: 1, borderColor: '#404142', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  tagsList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  tag: { backgroundColor: '#0a66c2', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, marginRight: 8, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  tagInput: { color: '#e4e6eb', fontSize: 14, padding: 0, marginTop: 4 },
  tagSuggestions: { marginTop: 8, backgroundColor: '#1a1a1b', borderWidth: 0 },
  tagSuggestion: { paddingVertical: 8, paddingHorizontal: 0 },
  tagSuggestionText: { fontSize: 13, color: '#e4e6eb' },
  pollBox: { marginTop: 8, padding: 12, backgroundColor: '#272729', borderRadius: 8, borderWidth: 1, borderColor: '#404142', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  pollQuestion: { color: '#e4e6eb', fontSize: 16, fontWeight: '600', padding: 8, marginBottom: 8, backgroundColor: '#1a1a1b', borderRadius: 6, borderWidth: 1, borderColor: '#343536' },
  pollOptionsList: { marginBottom: 8 },
  pollOptionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pollOptionText: { flex: 1, color: '#e4e6eb', fontSize: 14, borderWidth: 1, borderColor: '#343536', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#1a1a1b' },
  pollRemove: { marginLeft: 8, width: 32, justifyContent: 'center', alignItems: 'center' },
  pollRemoveText: { color: '#ff4500', fontSize: 16 },
  addOption: { paddingVertical: 8, marginBottom: 8 },
  addOptionText: { color: '#0a66c2', fontWeight: '600', fontSize: 13 },
  pollClose: { color: '#e4e6eb', fontSize: 13, borderWidth: 1, borderColor: '#343536', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, marginTop: 8, backgroundColor: '#1a1a1b' },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1a1a1b', paddingHorizontal: 16, paddingVertical: 8, paddingBottom: Platform.OS === 'ios' ? 20 : 8, borderTopWidth: 1, borderTopColor: '#343536' },
  toolBtn: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 },
  toolBtnActive: { backgroundColor: '#272729' },
  toolIcon: { fontSize: 16, color: '#818384', fontWeight: '600' },
});

export default CreatePostScreen;