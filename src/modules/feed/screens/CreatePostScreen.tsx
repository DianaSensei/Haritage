import { useAuthStore } from '@/core/store/slices/authSlice';
import { useFeedStore } from '@/core/store/slices/feedSlice';
import { useAppTheme } from '@/shared/hooks';
import { feedStorageService } from '@/shared/services/storage/feedStorageService';
import { FeedItem } from '@/shared/types';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { prependItem } = useFeedStore();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { t } = useTranslation();

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
      (tag) =>
        tag.toLowerCase().startsWith(lastWord.toLowerCase()) &&
        !selectedTags.map((selectedTag) => selectedTag.toLowerCase()).includes(tag.toLowerCase())
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
        if (lastWord && !selectedTags.map((tag) => tag.toLowerCase()).includes(lastWord.toLowerCase())) {
          addTagToSelected(lastWord);
          setTagInput('');
        }
      }
    }
  };

  const addTagToSelected = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (!cleanTag || selectedTags.map((item) => item.toLowerCase()).includes(cleanTag)) return;
    setSelectedTags([...selectedTags, cleanTag]);
    if (!usedTags.map((item) => item.toLowerCase()).includes(cleanTag)) {
      setUsedTags([...usedTags, cleanTag]);
    }
  };

  const addTag = (tag: string) => {
    addTagToSelected(tag);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((item) => item !== tag));
  };

  const pickMedia = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('createPost.alerts.permissionTitle'), t('createPost.alerts.permissionBody'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      } as any);
      if (result.canceled || !result.assets) return;
      const added = result.assets.map((asset) => ({
        uri: asset.uri,
        type: (asset.type === 'video' ? 'video' : 'image') as 'image' | 'video',
      }));
      setSelectedMedia((prev) => [...prev, ...added]);
    } catch (error) {
      console.warn('pickMedia error', error);
      Alert.alert(t('createPost.alerts.errorTitle'), t('createPost.alerts.mediaError'));
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
    setPoll({ ...poll, options: poll.options.filter((option) => option.id !== id) });
  };

  const updatePollOption = (id: string, text: string) => {
    if (!poll) return;
    setPoll({ ...poll, options: poll.options.map((option) => (option.id === id ? { ...option, text } : option)) });
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(t('createPost.alerts.validationTitle'), t('createPost.validation.titleRequired'));
      return;
    }
    const hasContent = body.trim() || selectedMedia.length > 0 || linkUrl.trim() || (poll && poll.question.trim());
    if (!hasContent) {
      Alert.alert(t('createPost.alerts.validationTitle'), t('createPost.validation.contentRequired'));
      return;
    }
    setIsSubmitting(true);
    try {
      const localPostId = `local-${Date.now()}`;
      const trimmedTitle = title.trim();
      const trimmedBody = body.trim();
      const trimmedLink = linkUrl.trim();
      const primaryMedia = selectedMedia[0];
      const pollOptions = poll
        ? poll.options.map((option) => option.text.trim()).filter(Boolean)
        : [];
      const pollData =
        poll && poll.question.trim() && pollOptions.length >= 2
          ? {
              question: poll.question.trim(),
              options: pollOptions,
              closeHours: parseInt(pollCloseHours, 10) || 24,
            }
          : undefined;

      const newItem: FeedItem = {
        id: localPostId,
        type: primaryMedia ? (primaryMedia.type === 'video' ? 'video' : 'image') : 'text',
        title: trimmedTitle || undefined,
        content: trimmedBody || trimmedLink || trimmedTitle || t('createPost.helper.defaultContent'),
        thumbnail: primaryMedia?.uri,
        videoUrl: primaryMedia?.type === 'video' ? primaryMedia.uri : undefined,
        mediaUris: selectedMedia.length ? selectedMedia.map((media) => media.uri) : undefined,
        url: trimmedLink || undefined,
        urlPreview: trimmedLink && linkPreview ? { ...linkPreview, url: trimmedLink } : undefined,
        poll: pollData,
        author: {
          id: String(user?.id ?? '0'),
          name: user?.name ?? t('createPost.helper.authorFallback'),
          avatar: user?.avatar ?? '',
        },
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        createdAt: new Date(),
      };

      await feedStorageService.addFeedItem(newItem);
      prependItem(newItem);

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

      Alert.alert(t('createPost.alerts.successTitle'), t('createPost.alerts.successBody'));
      router.back();
    } catch (error) {
      console.warn('create post error', error);
      Alert.alert(t('createPost.alerts.errorTitle'), t('createPost.alerts.errorBody'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>{t('createPost.unauthenticatedTitle')}</Text>
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
            <Text style={styles.postBtnText}>
              {isSubmitting ? t('createPost.submitting') : t('createPost.submit')}
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('createPost.titlePlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={styles.titleInput}
            maxLength={300}
          />
          <View style={styles.contentBox}>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder={t('createPost.bodyPlaceholder')}
              placeholderTextColor={colors.textMuted}
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
                        setLinkValidationError(t('createPost.urlInvalid'));
                      } else {
                        setLinkValidationError('');
                        setLinkPreview({ url, title: new URL(url).hostname, description: url });
                      }
                    }
                  }}
                  placeholder={t('createPost.urlPlaceholder')}
                  placeholderTextColor={colors.textMuted}
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
                {selectedMedia.map((media, index) => (
                  <View key={`${media.uri}-${index}`} style={styles.mediaBox}>
                    <Image source={{ uri: media.uri }} style={styles.mediaThumbnail} />
                    <TouchableOpacity style={styles.mediaBadge} onPress={() => setSelectedMedia((prev) => prev.filter((_, idx) => idx !== index))}>
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
                placeholder={t('createPost.tagPlaceholder')}
                placeholderTextColor={colors.textMuted}
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
                  placeholder={t('createPost.pollQuestionPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  style={styles.pollQuestion}
                />
                {poll && (
                  <>
                    <View style={styles.pollOptionsList}>
                      {poll.options.map((option, idx) => (
                        <View key={option.id} style={styles.pollOptionRow}>
                          <TextInput
                            value={option.text}
                            onChangeText={(text) => updatePollOption(option.id, text)}
                            placeholder={t('createPost.pollOptionPlaceholder', { index: idx + 1 })}
                            placeholderTextColor={colors.textMuted}
                            style={styles.pollOptionText}
                          />
                          {poll.options.length > 2 && (
                            <TouchableOpacity style={styles.pollRemove} onPress={() => removePollOption(option.id)}>
                              <Text style={styles.pollRemoveText}>✕</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                    {poll.options.length < 4 && (
                      <TouchableOpacity style={styles.addOption} onPress={addPollOption}>
                        <Text style={styles.addOptionText}>{t('createPost.pollAddOption')}</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
                <TextInput
                  value={pollCloseHours}
                  onChangeText={setPollCloseHours}
                  placeholder={t('createPost.pollCloseHoursPlaceholder')}
                  placeholderTextColor={colors.textMuted}
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
            accessibilityRole="button"
            accessibilityLabel={t('createPost.toolbar.add')}
          >
            <Text style={[styles.toolIcon, showUrlInput && styles.toolIconActive]}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={pickMedia}
            accessibilityRole="button"
            accessibilityLabel={t('createPost.toolbar.media')}
          >
            <Text style={styles.toolIcon}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, showPollCreator && styles.toolBtnActive]}
            onPress={() => {
              setShowPollCreator(!showPollCreator);
              if (!showPollCreator && !poll) setPoll({ question: '', options: [{ id: '1', text: '' }, { id: '2', text: '' }] });
            }}
            accessibilityRole="button"
            accessibilityLabel={t('createPost.toolbar.poll')}
          >
            <Text style={[styles.toolIcon, showPollCreator && styles.toolIconActive]}>•</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (
  colors: ReturnType<typeof useAppTheme>['colors'],
  isDark: boolean,
) => {
  const sheetBackground = isDark ? colors.surfaceSecondary : colors.surface;
  const inputBackground = isDark ? colors.surfaceTertiary : colors.surfaceSecondary;
  const innerBackground = isDark ? colors.surface : colors.card;
  const borderColor = colors.border;
  const dividerColor = isDark ? colors.borderMuted : colors.border;
  const shadowColor = isDark ? '#000000' : colors.shadow;
  const overlayColor = isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(17, 24, 28, 0.35)';

  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    info: { color: colors.text, fontSize: 16 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: dividerColor,
      backgroundColor: sheetBackground,
    },
  close: { fontSize: 22, color: colors.icon, fontWeight: '700' },
    postBtn: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.accent,
      borderRadius: 20,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 3,
    },
    postBtnDisabled: { opacity: 0.6 },
    postBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
    scrollContent: { flex: 1, paddingHorizontal: 20, paddingVertical: 16 },
    titleInput: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
      marginVertical: 12,
      padding: 14,
      backgroundColor: inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor,
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.14,
      shadowRadius: 6,
      elevation: 3,
    },
    contentBox: { flex: 1, gap: 12 },
    bodyInput: {
      color: colors.text,
      fontSize: 16,
      flex: 1,
      padding: 14,
      minHeight: 140,
      backgroundColor: inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor,
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.12,
      shadowRadius: 6,
      elevation: 2,
    },
    urlInput: {
      color: colors.text,
      fontSize: 14,
      marginTop: 8,
      padding: 12,
      backgroundColor: inputBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor,
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.28 : 0.12,
      shadowRadius: 5,
      elevation: 2,
    },
    errorMsg: { color: colors.danger, fontSize: 12, marginTop: 6 },
    previewBox: {
      marginTop: 10,
      padding: 12,
      backgroundColor: inputBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor,
      gap: 4,
    },
    previewTitle: { color: colors.text, fontWeight: '600', fontSize: 13 },
    previewUrl: { color: colors.textMuted, fontSize: 11 },
    mediaGallery: { marginTop: 10, marginHorizontal: -20, paddingHorizontal: 20, paddingVertical: 10 },
    mediaBox: { position: 'relative', marginRight: 14 },
    mediaThumbnail: {
      width: 110,
      height: 110,
      borderRadius: 12,
      backgroundColor: inputBackground,
      borderWidth: 1,
      borderColor,
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.28 : 0.12,
      shadowRadius: 5,
      elevation: 3,
    },
    mediaBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
      backgroundColor: overlayColor,
      width: 26,
      height: 26,
      borderRadius: 13,
      justifyContent: 'center',
      alignItems: 'center',
    },
    mediaBadgeText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
    tagsBox: {
      marginTop: 12,
      padding: 14,
      backgroundColor: inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor,
      gap: 8,
    },
    tagsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: {
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    tagText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
    tagInput: { color: colors.text, fontSize: 14, padding: 0, marginTop: 4 },
    tagSuggestions: {
      marginTop: 6,
      paddingVertical: 6,
      backgroundColor: innerBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: dividerColor,
      gap: 4,
    },
    tagSuggestion: { paddingVertical: 6 },
    tagSuggestionText: { fontSize: 13, color: colors.text },
    pollBox: {
      marginTop: 12,
      padding: 14,
      backgroundColor: inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor,
      gap: 10,
    },
    pollQuestion: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: innerBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: dividerColor,
    },
    pollOptionsList: { gap: 10 },
    pollOptionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    pollOptionText: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      borderWidth: 1,
      borderColor: dividerColor,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: innerBackground,
    },
    pollRemove: { width: 32, justifyContent: 'center', alignItems: 'center' },
    pollRemoveText: { color: colors.danger, fontSize: 16 },
    addOption: { paddingVertical: 6 },
    addOptionText: { color: colors.textLink, fontWeight: '600', fontSize: 13 },
    pollClose: {
      color: colors.text,
      fontSize: 13,
      borderWidth: 1,
      borderColor: dividerColor,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 9,
      backgroundColor: innerBackground,
      width: 100,
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: sheetBackground,
      paddingHorizontal: 20,
      paddingVertical: 12,
      paddingBottom: Platform.OS === 'ios' ? 24 : 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: dividerColor,
    },
    toolBtn: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: inputBackground,
      borderWidth: 1,
      borderColor: dividerColor,
    },
    toolBtnActive: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
    toolIcon: { fontSize: 16, color: colors.icon, fontWeight: '600' },
    toolIconActive: { color: colors.accent },
  });
};

export default CreatePostScreen;