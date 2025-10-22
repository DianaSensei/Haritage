import { NotificationBell } from '@/modules/notifications/components/NotificationBell';
import React from 'react';
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FeedHeaderProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  tagQuery: string;
  onTagChange: (v: string) => void;
  dateFilter: 'all' | '24h' | '7d' | '30d';
  onDateFilterChange: (d: 'all' | '24h' | '7d' | '30d') => void;
  onBellPress: () => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  searchQuery,
  onSearchChange,
  tagQuery,
  onTagChange,
  dateFilter,
  onDateFilterChange,
  onBellPress,
}) => {
  const insets = useSafeAreaInsets();

  // baseTopPadding mirrors the visual padding we want inside the header
  const baseTopPadding = 12;

  return (
    <View style={[styles.container, { paddingTop: baseTopPadding + insets.top }]}> 
      <View style={styles.topRow}>
        <Text style={styles.title}>Feed</Text>
        <NotificationBell onPress={onBellPress} size={28} color="#007AFF" />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search feeds..."
          value={searchQuery}
          onChangeText={onSearchChange}
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        <TextInput
          placeholder="Tags (comma separated)"
          value={tagQuery}
          onChangeText={onTagChange}
          style={styles.tagInput}
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      </View>

      <View style={styles.dateFilters}>
        {(['all', '24h', '7d', '30d'] as const).map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => onDateFilterChange(d)}
            style={[styles.dateButton, dateFilter === d && styles.dateButtonActive]}
          >
            <Text style={[styles.dateButtonText, dateFilter === d && styles.dateButtonTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#F6F8FA',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    fontSize: 13,
  },
  tagInput: {
    backgroundColor: '#F6F8FA',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    width: 120,
    fontSize: 13,
  },
  dateFilters: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dateButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  dateButtonActive: {
    backgroundColor: '#007AFF',
  },
  dateButtonText: {
    color: '#666',
    fontSize: 12,
  },
  dateButtonTextActive: {
    color: '#fff',
    fontSize: 12,
  },
});
