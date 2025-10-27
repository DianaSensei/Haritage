import { ThemedText } from '@/shared/components';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
      Alert.alert('Error', 'Could not load storage data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        Alert.alert('Error', 'Could not save this entry.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [editedValues, loadEntries]
  );

  const handleDeleteEntry = useCallback(
    (key: string) => {
      Alert.alert('Delete Entry', `Remove “${key}” from storage?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await AsyncStorage.removeItem(key);
              await loadEntries();
            } catch (error) {
              console.warn('Failed to delete entry', error);
              Alert.alert('Error', 'Could not delete this entry.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]);
    },
    [loadEntries]
  );

  const handleAddEntry = useCallback(async () => {
    if (!newKey.trim()) {
      Alert.alert('Missing key', 'Provide a storage key.');
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
      Alert.alert('Error', 'Could not create the entry.');
    } finally {
      setIsSubmitting(false);
    }
  }, [loadEntries, newKey, newValue]);

  const renderEntry = (entry: StorageEntry) => (
    <View key={entry.key} style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.entryTitleRow}>
          <Ionicons name="document-text" size={16} color="#0a66c2" />
          <ThemedText style={styles.entryKey}>{entry.key}</ThemedText>
        </View>
        <View style={styles.entryActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={() => handleSaveEntry(entry.key)}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Ionicons name="save" size={16} color="#ffffff" />
            <ThemedText style={styles.actionButtonText}>Save</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteEntry(entry.key)}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Ionicons name="trash" size={16} color="#ffffff" />
            <ThemedText style={styles.actionButtonText}>Delete</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
      <TextInput
        multiline
        style={styles.entryInput}
        value={editedValues[entry.key] ?? ''}
        onChangeText={(value) => handleValueChange(entry.key, value)}
        placeholder="Value"
        placeholderTextColor="#5c5d60"
        autoCorrect={false}
        spellCheck={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#e4e6eb" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Debug Tools</ThemedText>
        <TouchableOpacity
          onPress={loadEntries}
          style={styles.refreshButton}
          activeOpacity={0.7}
          disabled={isLoading || isSubmitting}
        >
          <Ionicons name="refresh" size={20} color="#e4e6eb" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <ThemedText style={styles.summaryTitle}>Storage Overview</ThemedText>
          <ThemedText style={styles.summaryValue}>{totalEntries} keys detected</ThemedText>
          {(isLoading || isSubmitting) && (
            <ActivityIndicator size="small" color="#0a66c2" style={styles.summarySpinner} />)
          }
        </View>

        <View style={styles.addCard}>
          <View style={styles.entryTitleRow}>
            <Ionicons name="add-circle" size={18} color="#27ae60" />
            <ThemedText style={styles.sectionLabel}>Insert New Item</ThemedText>
          </View>
          <TextInput
            style={styles.entryInput}
            value={newKey}
            onChangeText={setNewKey}
            placeholder="Key"
            placeholderTextColor="#5c5d60"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[styles.entryInput, styles.newValueInput]}
            multiline
            value={newValue}
            onChangeText={setNewValue}
            placeholder="Value"
            placeholderTextColor="#5c5d60"
            autoCorrect={false}
            spellCheck={false}
          />
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton, styles.addButton]}
            onPress={handleAddEntry}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Ionicons name="save" size={16} color="#ffffff" />
            <ThemedText style={styles.actionButtonText}>Save Item</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.entryList}>
          {isLoading && entries.length === 0 ? (
            <ActivityIndicator size="large" color="#0a66c2" style={styles.loader} />
          ) : entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="file-tray" size={32} color="#5c5d60" />
              <ThemedText style={styles.emptyText}>No storage entries detected.</ThemedText>
            </View>
          ) : (
            entries.map(renderEntry)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#343536',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#272729',
    borderWidth: 1,
    borderColor: '#404142',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e4e6eb',
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#272729',
    borderWidth: 1,
    borderColor: '#404142',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e4e6eb',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 14,
    color: '#b1b2b6',
  },
  summarySpinner: {
    marginTop: 12,
  },
  addCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#272729',
    borderWidth: 1,
    borderColor: '#404142',
    gap: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e4e6eb',
  },
  entryList: {
    gap: 16,
  },
  entryCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#272729',
    borderWidth: 1,
    borderColor: '#404142',
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
    color: '#e4e6eb',
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#0a66c2',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  primaryButton: {
    backgroundColor: '#0a66c2',
  },
  addButton: {
    alignSelf: 'flex-start',
  },
  entryInput: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3b3c',
    backgroundColor: '#1e1f20',
    padding: 12,
    color: '#e4e6eb',
    fontSize: 13,
  },
  newValueInput: {
    minHeight: 80,
  },
  emptyState: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#343536',
    backgroundColor: '#1e1f20',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#818384',
  },
  loader: {
    marginTop: 24,
  },
});
