import { NotificationBell } from '@/modules/notifications/components/NotificationBell';
import { IconSymbol } from '@/shared/components';
import React, { useState } from 'react';
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
  const [showFilters, setShowFilters] = useState(false);
    const baseTopPadding = 8;

    return (
      <View style={[styles.container, { paddingTop: baseTopPadding + insets.top }]}> 
        <View style={styles.compactRow}>
          <IconSymbol name="leaf.fill" size={28} color="#007AFF" />

          <View style={styles.searchWrapper}>
            <IconSymbol name="magnifyingglass" size={16} color="#999" style={styles.searchIcon} />
            <TextInput
              placeholder="Search feeds"
              value={searchQuery}
              onChangeText={onSearchChange}
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <TouchableOpacity
              style={styles.filterToggle}
              onPress={() => setShowFilters((prev: boolean) => !prev)}
              accessibilityLabel="Toggle filters"
            >
              <IconSymbol name="line.3.horizontal.decrease" size={18} color="#666" />
            </TouchableOpacity>
          </View>

          <NotificationBell onPress={onBellPress} size={26} color="#007AFF" />
        </View>

        {showFilters && (
          <View style={styles.filtersInline}>
            <TextInput
              placeholder="Tags (comma separated)"
              value={tagQuery}
              onChangeText={onTagChange}
              style={styles.tagInputCompact}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <View style={styles.dateFiltersCompact}>
              {(['all', '24h', '7d', '30d'] as const).map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => onDateFilterChange(d)}
                  style={[styles.dateChip, dateFilter === d && styles.dateChipActive]}
                >
                  <Text style={[styles.dateChipText, dateFilter === d && styles.dateChipTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
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
    paddingHorizontal: 8,
    paddingLeft: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
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
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchWrapper: {
    flex: 1,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 8,
    zIndex: 1,
  },
  filterToggle: {
    padding: 8,
    marginLeft: 6,
    borderRadius: 8,
  },
  filtersInline: {
    marginTop: 8,
  },
  tagInputCompact: {
    backgroundColor: '#F6F8FA',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 8,
  },
  dateFiltersCompact: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dateChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  dateChipActive: {
    backgroundColor: '#007AFF',
  },
  dateChipText: {
    color: '#666',
    fontSize: 12,
  },
  dateChipTextActive: {
    color: '#fff',
    fontSize: 12,
  },
});
