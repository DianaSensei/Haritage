import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { CONFIG } from '@/core/config';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnail?: string;
  isActive: boolean;
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
  onError?: (error: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnail,
  isActive,
  onPlaybackStatusUpdate,
  onError,
}) => {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (isActive && CONFIG.VIDEO.AUTO_PLAY) {
      playVideo();
    } else {
      pauseVideo();
    }
  }, [isActive]);

  const playVideo = async () => {
    try {
      await videoRef.current?.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing video:', error);
      onError?.('Failed to play video');
    }
  };

  const pauseVideo = async () => {
    try {
      await videoRef.current?.pauseAsync();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing video:', error);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        // Auto-replay if configured
        if (CONFIG.VIDEO.AUTO_PLAY) {
          videoRef.current?.replayAsync();
        }
      }
    }
    
    onPlaybackStatusUpdate?.(status);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    console.error('Video error:', error);
    onError?.('Failed to load video');
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={() => setShowControls(!showControls)}
      >
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: videoUrl }}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isActive && CONFIG.VIDEO.AUTO_PLAY}
          isLooping={false}
          isMuted={CONFIG.VIDEO.MUTED_BY_DEFAULT}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {showControls && (
          <View style={styles.controlsOverlay}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={50}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        )}

        {showControls && (
          <View style={styles.bottomControls}>
            <Text style={styles.timeText}>
              {formatTime(position)}
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress * 100}%` }
                  ]}
                />
              </View>
            </View>
            <Text style={styles.timeText}>
              {formatTime(duration)}
            </Text>
          </View>
        )}

        {!isPlaying && !isLoading && (
          <View style={styles.playOverlay}>
            <TouchableOpacity
              style={styles.centerPlayButton}
              onPress={togglePlayPause}
            >
              <Ionicons name="play" size={60} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
    width: screenWidth,
    height: screenHeight * 0.6, // Adjust height as needed
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    padding: 20,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  centerPlayButton: {
    padding: 20,
  },
});
