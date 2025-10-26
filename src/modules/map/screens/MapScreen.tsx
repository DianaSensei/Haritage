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
          <Ionicons name="location" size={14} color="#0a66c2" />
          <Text style={styles.coordinates}>
            {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderMapPreview = () => (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={48} color="#0a66c2" />
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
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stores..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
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
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No stores found</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1b',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1b',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#343536',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e4e6eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#272729',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404142',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#e4e6eb',
    fontSize: 16,
    paddingVertical: 10,
  },
  mapContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#272729',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#404142',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  mapPlaceholder: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#1a1a1b',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e4e6eb',
    marginTop: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 12,
    color: '#818384',
    marginTop: 4,
  },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#343536',
  },
  mapGridItem: {
    width: '50%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#343536',
    borderBottomWidth: 1,
    borderBottomColor: '#343536',
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
    color: '#818384',
    fontWeight: '500',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#343536',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#818384',
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
    backgroundColor: '#272729',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#404142',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    color: '#e4e6eb',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 12,
    color: '#818384',
    marginBottom: 6,
  },
  coordinatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coordinates: {
    fontSize: 11,
    color: '#0a66c2',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#818384',
    marginTop: 8,
  },
});
