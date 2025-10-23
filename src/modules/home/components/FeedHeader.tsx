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
  const [searchMode, setSearchMode] = useState<'keyword' | 'tag'>('keyword');
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleSearchChange = (text: string) => {
    if (searchMode === 'keyword') {
      onSearchChange(text);
      setSuggestionsVisible(text.toLowerCase() === 'tag');
    }
  };

  const selectSearchMode = (mode: 'keyword' | 'tag') => {
    setSearchMode(mode);
    setSuggestionsVisible(false);
    if (mode === 'tag') {
      onSearchChange('');
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = tagQuery ? tagQuery.split(',').map(t => t.trim()) : [];
      const newTags = [...currentTags, newTag.trim()].join(', ');
      onTagChange(newTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = tagQuery.split(',').map(t => t.trim()).filter(t => t !== tagToRemove);
    onTagChange(currentTags.join(', '));
  };
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}> 
        <View style={styles.compactRow}>
          <IconSymbol name="leaf.fill" size={28} color="#007AFF" />

          <View style={styles.searchWrapper}>
            <View style={styles.searchBar}>
              {searchMode === 'keyword' ? (
                <TextInput
                  placeholder="Search feeds"
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  style={styles.searchInput}
                  returnKeyType="search"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              ) : (
                <View style={styles.tagSearchContainer}>
                  {tagQuery.split(',').map((tag, index) => (
                    tag.trim() && (
                      <TouchableOpacity
                        key={index}
                        style={styles.tagChip}
                        onPress={() => removeTag(tag.trim())}
                      >
                        <Text style={styles.tagChipText}>{tag.trim()}</Text>
                        <Text style={styles.tagChipRemove}>×</Text>
                      </TouchableOpacity>
                    )
                  ))}
                  <TextInput
                    placeholder="Add tag"
                    value={newTag}
                    onChangeText={setNewTag}
                    style={styles.tagInputInline}
                    returnKeyType="done"
                    onSubmitEditing={addTag}
                  />
                </View>
              )}
              <TouchableOpacity
                style={styles.filterToggleInside}
                onPress={() => setShowFilters((prev: boolean) => !prev)}
                accessibilityLabel="Toggle filters"
              >
                <IconSymbol name="line.3.horizontal.decrease" size={18} color="#666" />
              </TouchableOpacity>
              <IconSymbol name="magnifyingglass" size={16} color="#999" style={styles.searchIconInside} />
            </View>
            {suggestionsVisible && (
              <View style={styles.suggestions}>
                <TouchableOpacity style={styles.suggestionItem} onPress={() => selectSearchMode('keyword')}>
                  <Text>Search by keyword</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionItem} onPress={() => selectSearchMode('tag')}>
                  <Text>Search by tag</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <NotificationBell onPress={onBellPress} size={26} color="#007AFF" />
        </View>

        {showFilters && (
          <View style={styles.filtersInline}>
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
    paddingRight: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    flex: 1,
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
  },
  searchBar: {
    position: 'relative',
  },
  filterToggleInside: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -9 }],
  },
  searchIconInside: {
    position: 'absolute',
    right: 40,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  searchIcon: {
    position: 'absolute',
    left: 8,
    zIndex: 1,
  },
  searchIconRight: {
    marginLeft: 8,
  },
  filterToggle: {
    padding: 8,
    borderRadius: 8,
  },
  filtersInline: {
    marginTop: 8,
  },
  tagSearchContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingRight: 60,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  tagChipText: {
    fontSize: 12,
    color: '#333',
  },
  tagChipRemove: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  tagInputInline: {
    flex: 1,
    fontSize: 13,
    minWidth: 60,
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    zIndex: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
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
