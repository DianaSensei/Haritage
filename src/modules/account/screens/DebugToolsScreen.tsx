import { ThemedText } from '@/shared/components';
import { SettingsHeader } from '@/shared/components/layout/SettingsHeader';
import { useAppTheme } from '@/shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StorageEntry {
  key: string;
  value: string;
}

const formatValueForEditor = (value: string | null): string => {
  if (!value) {
    return '';
  }

  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
};

export const DebugToolsScreen: React.FC = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const placeholderColor = colors.textMuted;
  const [entries, setEntries] = useState<StorageEntry[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const keys = await AsyncStorage.getAllKeys();
      if (keys.length === 0) {
        setEntries([]);
        setEditedValues({});
        return;
      }

      const pairs = await AsyncStorage.multiGet(keys);
      const nextEntries: StorageEntry[] = pairs.map(([key, value]) => ({
        key,
        value: formatValueForEditor(value ?? ''),
      }));

      const nextEdited: Record<string, string> = {};
      nextEntries.forEach((entry) => {
        nextEdited[entry.key] = entry.value;
      });

      setEntries(nextEntries);
      setEditedValues(nextEdited);
    } catch (error) {
      console.warn('Failed to load storage entries', error);
      Alert.alert(t('debugTools.alerts.load.title'), t('debugTools.alerts.load.body'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const totalEntries = useMemo(() => entries.length, [entries]);

  const handleValueChange = useCallback((key: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSaveEntry = useCallback(
    async (key: string) => {
      const value = editedValues[key] ?? '';
      setIsSubmitting(true);
      try {
        await AsyncStorage.setItem(key, value);
        await loadEntries();
      } catch (error) {
        console.warn('Failed to save entry', error);
        Alert.alert(t('debugTools.alerts.save.title'), t('debugTools.alerts.save.body'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [editedValues, loadEntries, t]
  );

  const handleDeleteEntry = useCallback(
    (key: string) => {
      Alert.alert(t('debugTools.alerts.confirmDelete.title'), t('debugTools.alerts.confirmDelete.body', { key }), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('debugTools.buttons.delete'),
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await AsyncStorage.removeItem(key);
              await loadEntries();
            } catch (error) {
              console.warn('Failed to delete entry', error);
              Alert.alert(t('debugTools.alerts.delete.title'), t('debugTools.alerts.delete.body'));
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]);
    },
    [loadEntries, t]
  );

  const handleAddEntry = useCallback(async () => {
    if (!newKey.trim()) {
      Alert.alert(t('debugTools.alerts.missingKey.title'), t('debugTools.alerts.missingKey.body'));
      return;
    }

    setIsSubmitting(true);
    try {
      await AsyncStorage.setItem(newKey.trim(), newValue);
      setNewKey('');
      setNewValue('');
      await loadEntries();
    } catch (error) {
      console.warn('Failed to create entry', error);
      Alert.alert(t('debugTools.alerts.create.title'), t('debugTools.alerts.create.body'));
    } finally {
      setIsSubmitting(false);
    }
  }, [loadEntries, newKey, newValue, t]);

  const renderEntry = (entry: StorageEntry) => (
    <View key={entry.key} style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.entryTitleRow}>
          <Ionicons name="document-text" size={16} color={colors.accent} />
          <ThemedText style={styles.entryKey}>{entry.key}</ThemedText>
        </View>
        <View style={styles.entryActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={() => handleSaveEntry(entry.key)}
            disabled={isSubmitting}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('debugTools.buttons.save')}
          >
            <Ionicons name="save" size={16} color="#ffffff" />
            <ThemedText style={styles.actionButtonText}>{t('debugTools.buttons.save')}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteEntry(entry.key)}
            disabled={isSubmitting}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('debugTools.buttons.delete')}
          >
            <Ionicons name="trash" size={16} color="#ffffff" />
            <ThemedText style={styles.actionButtonText}>{t('debugTools.buttons.delete')}</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
      <TextInput
        multiline
        style={styles.entryInput}
        value={editedValues[entry.key] ?? ''}
        onChangeText={(value) => handleValueChange(entry.key, value)}
        placeholder={t('debugTools.placeholders.value')}
        placeholderTextColor={placeholderColor}
        autoCorrect={false}
        spellCheck={false}
      />
    </View>
  );

  const isRefreshing = isLoading || isSubmitting;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <SettingsHeader
        title={t('debugTools.title')}
        onBack={() => router.back()}
        backAccessibilityLabel={t('common.goBack')}
        rightAccessory={
          <TouchableOpacity
            style={[styles.headerAction, isRefreshing && styles.headerActionDisabled]}
            onPress={loadEntries}
            activeOpacity={0.7}
            disabled={isRefreshing}
            accessibilityRole="button"
            accessibilityLabel={t('debugTools.actions.refresh')}
          >
            <Ionicons name="refresh" size={18} color={colors.icon} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.helperCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <View style={styles.helperTextGroup}>
            <ThemedText style={styles.helperText}>{t('debugTools.helper.primary')}</ThemedText>
            <ThemedText style={styles.helperSubtext}>{t('debugTools.helper.secondary')}</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('debugTools.sections.overview.title')}</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('debugTools.sections.overview.description', { count: totalEntries })}
          </ThemedText>
        </View>

        <View style={styles.optionCard}>
          <View style={styles.optionRow}>
            <View style={styles.optionIcon}>
              <Ionicons name="layers-outline" size={18} color={colors.accent} />
            </View>
            <View style={styles.optionContent}>
              <ThemedText style={styles.optionTitle}>{t('debugTools.sections.overview.title')}</ThemedText>
              <ThemedText style={styles.optionDescription}>
                {t('debugTools.summary.count', { count: totalEntries })}
              </ThemedText>
            </View>
            {isRefreshing ? <ActivityIndicator size="small" color={colors.accent} /> : null}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('debugTools.sections.manage.title')}</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('debugTools.sections.manage.description')}
          </ThemedText>
        </View>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            value={newKey}
            onChangeText={setNewKey}
            placeholder={t('debugTools.placeholders.key')}
            placeholderTextColor={placeholderColor}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={newValue}
            onChangeText={setNewValue}
            placeholder={t('debugTools.placeholders.value')}
            placeholderTextColor={placeholderColor}
            autoCorrect={false}
            spellCheck={false}
          />
          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
            onPress={handleAddEntry}
            disabled={isSubmitting}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('debugTools.buttons.saveItem')}
          >
            <Ionicons name="save" size={16} color="#ffffff" />
            <ThemedText style={styles.primaryButtonText}>{t('debugTools.buttons.saveItem')}</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('debugTools.sections.entries.title')}</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('debugTools.sections.entries.description')}
          </ThemedText>
        </View>

        <View style={styles.entryList}>
          {isLoading && entries.length === 0 ? (
            <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
          ) : entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="file-tray" size={32} color={colors.iconMuted} />
              <ThemedText style={styles.emptyText}>{t('debugTools.empty')}</ThemedText>
            </View>
          ) : (
            entries.map(renderEntry)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 20,
    },
    headerAction: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerActionDisabled: {
      opacity: 0.5,
    },
    helperCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.infoSoft,
      borderWidth: 1,
      borderColor: colors.info,
    },
    helperTextGroup: {
      flex: 1,
      gap: 4,
    },
    helperText: {
      fontSize: 14,
      color: colors.text,
    },
    helperSubtext: {
      fontSize: 13,
      color: colors.textMuted,
    },
    section: {
      gap: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    sectionDescription: {
      fontSize: 14,
      color: colors.textMuted,
    },
    optionCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 16,
    },
    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.borderMuted,
    },
    optionContent: {
      flex: 1,
      gap: 4,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    optionDescription: {
      fontSize: 13,
      color: colors.textMuted,
    },
    formCard: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    input: {
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 13,
      color: colors.text,
    },
    textArea: {
      minHeight: 96,
    },
    primaryButton: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.accent,
    },
    primaryButtonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff',
    },
    entryList: {
      gap: 16,
    },
    entryCard: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    entryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    entryTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    entryKey: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    entryActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.surfaceSecondary,
    },
    saveButton: {
      backgroundColor: colors.accent,
    },
    deleteButton: {
      backgroundColor: colors.danger,
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#ffffff',
    },
    entryInput: {
      minHeight: 96,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      padding: 12,
      color: colors.text,
      fontSize: 13,
    },
    emptyState: {
      alignItems: 'center',
      gap: 12,
      paddingVertical: 32,
      paddingHorizontal: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
    },
    loader: {
      marginTop: 16,
    },
  });
