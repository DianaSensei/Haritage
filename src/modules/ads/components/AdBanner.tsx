import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdItem } from '@/shared/types';

interface AdBannerProps {
  ad: AdItem;
  onPress: (ad: AdItem) => void;
  onDismiss?: (adId: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const AdBanner: React.FC<AdBannerProps> = ({
  ad,
  onPress,
  onDismiss,
}) => {
  const handlePress = () => {
    onPress(ad);
  };

  const handleDismiss = () => {
    onDismiss?.(ad.id);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.adContent}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: ad.imageUrl }}
          style={styles.adImage}
          resizeMode="cover"
        />
        <View style={styles.adOverlay}>
          <View style={styles.adTextContainer}>
            <Text style={styles.adTitle}>{ad.title}</Text>
            <Text style={styles.adDescription}>{ad.description}</Text>
          </View>
          <View style={styles.adBadge}>
            <Text style={styles.adBadgeText}>Ad</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {onDismiss && (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
        >
          <Ionicons name="close" size={16} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adContent: {
    position: 'relative',
  },
  adImage: {
    width: '100%',
    height: 120,
  },
  adOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  adTextContainer: {
    flex: 1,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  adDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  adBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  dismissButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
