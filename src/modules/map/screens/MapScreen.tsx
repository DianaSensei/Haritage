import { useAppTheme } from '@/shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  thumbnail?: string;
}

// Mock store data
const MOCK_STORES: Store[] = [
  {
    id: '1',
    name: 'Vintage Artifacts & Antiques',
    address: '123 Heritage Lane, Downtown District',
    latitude: 40.7128,
    longitude: -74.0060,
    thumbnail: 'https://via.placeholder.com/80x80/8B4513/FFFFFF?text=Store1',
  },
  {
    id: '2',
    name: 'Heritage Museum Shop',
    address: '456 History Avenue, Museum Quarter',
    latitude: 40.7614,
    longitude: -73.9776,
    thumbnail: 'https://via.placeholder.com/80x80/A0522D/FFFFFF?text=Store2',
  },
  {
    id: '3',
    name: 'Cultural Relics Collection',
    address: '789 Tradition Street, Old Town',
    latitude: 40.7580,
    longitude: -73.9855,
    thumbnail: 'https://via.placeholder.com/80x80/CD853F/FFFFFF?text=Store3',
  },
  {
    id: '4',
    name: 'Ancient Treasures Emporium',
    address: '321 Legacy Place, Arts District',
    latitude: 40.7505,
    longitude: -73.9972,
    thumbnail: 'https://via.placeholder.com/80x80/DAA520/FFFFFF?text=Store4',
  },
  {
    id: '5',
    name: 'Classic Collectibles Hub',
    address: '654 Memory Lane, Vintage Quarter',
    latitude: 40.7489,
    longitude: -73.9680,
    thumbnail: 'https://via.placeholder.com/80x80/B8860B/FFFFFF?text=Store5',
  },
];

export const MapScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_STORES;
    return MOCK_STORES.filter(store =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleOpenMaps = (store: Store) => {
    const mapsUrl = `geo:${store.latitude},${store.longitude}?q=${encodeURIComponent(store.name)}`;
    Linking.openURL(mapsUrl).catch(() => {
      Alert.alert('Error', 'Could not open maps application');
    });
  };

  const handleStorePress = (store: Store) => {
    Alert.alert(
      store.name,
      `📍 ${store.address}\n\nLat: ${store.latitude.toFixed(4)}\nLng: ${store.longitude.toFixed(4)}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Open in Maps', onPress: () => handleOpenMaps(store) },
      ]
    );
  };

  const renderStoreItem = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => handleStorePress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.storeThumbnail}
      />
      <View style={styles.storeInfo}>
        <Text style={styles.storeName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.storeAddress} numberOfLines={1}>{item.address}</Text>
        <View style={styles.coordinatesRow}>
          <Ionicons name="location" size={14} color={colors.accent} />
          <Text style={styles.coordinates}>
            {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.iconMuted} />
    </TouchableOpacity>
  );

  const renderMapPreview = () => (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={48} color={colors.accent} />
        <Text style={styles.mapPlaceholderText}>Map View</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          {filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''} found
        </Text>
      </View>
      <View style={styles.mapGrid}>
        {filteredStores.slice(0, 4).map((store, idx) => (
          <TouchableOpacity
            key={store.id}
            style={[
              styles.mapGridItem,
              idx % 2 === 1 && styles.mapGridItemRight,
            ]}
            onPress={() => handleStorePress(store)}
          >
            <Image
              source={{ uri: store.thumbnail }}
              style={styles.gridItemThumbnail}
            />
            <Text style={styles.gridItemName} numberOfLines={1}>{store.name.split(' ')[0]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Store Locator</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.icon} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stores..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.iconMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Map Preview */}
        {renderMapPreview()}

        {/* Stores List */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {filteredStores.length} Store{filteredStores.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <FlatList
          data={filteredStores}
          keyExtractor={(item) => item.id}
          renderItem={renderStoreItem}
          scrollEnabled={true}
          style={styles.storesList}
          contentContainerStyle={styles.storesListContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.iconMuted} />
              <Text style={styles.emptyStateText}>No stores found</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (
  colors: ReturnType<typeof useAppTheme>['colors'],
  isDark: boolean,
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.45 : 0.15,
      shadowRadius: 6,
      elevation: 3,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      paddingVertical: 10,
    },
    mapContainer: {
      marginHorizontal: 16,
      marginVertical: 12,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.45 : 0.15,
      shadowRadius: 6,
      elevation: 3,
    },
    mapPlaceholder: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    mapPlaceholderText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 8,
    },
    mapPlaceholderSubtext: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
    },
    mapGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    mapGridItem: {
      width: '50%',
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: colors.border,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
    },
    mapGridItemRight: {
      borderRightWidth: 0,
    },
    gridItemThumbnail: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginBottom: 6,
    },
    gridItemName: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
    },
    listHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    listTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
    },
    storesList: {
      flex: 1,
    },
    storesListContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    storeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
  marginBottom: 12,
      paddingVertical: 12,
      paddingHorizontal: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.45 : 0.15,
      shadowRadius: 6,
      elevation: 3,
    },
    storeThumbnail: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginRight: 12,
    },
    storeInfo: {
      flex: 1,
    },
    storeName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    storeAddress: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 6,
    },
    coordinatesRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    coordinates: {
      fontSize: 11,
      color: colors.accent,
      marginLeft: 4,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 8,
    },
  });
