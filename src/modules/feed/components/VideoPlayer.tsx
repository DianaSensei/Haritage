import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnail?: string;
  isActive: boolean;
  onPlaybackStatusUpdate?: (status: any) => void;
  onError?: (error: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const MAX_VIDEO_HEIGHT = screenWidth * 0.5625;

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  isActive,
  onPlaybackStatusUpdate,
  onError,
}) => {
  const errorReportedRef = useRef(false);
  const player = useVideoPlayer(videoUrl, (instance) => {
    try {
      instance.loop = true;
      instance.muted = true;
    } catch (error) {
      console.warn('Video player init error', error);
    }
  });

  useEffect(() => {
    if (!player) return;

    const togglePlayback = async () => {
      try {
        if (isActive) {
          await player.play();
        } else {
          await player.pause();
        }
      } catch (error) {
        console.warn('Video control error', error);
        onError?.('Failed to control playback');
      }
    };

    togglePlayback();
  }, [isActive, onError, player]);

  useEffect(() => {
    if (!player) return;

    const id = setInterval(() => {
      try {
  const status: any = player.status ?? null;
        if (status) {
          if (status.error && !errorReportedRef.current) {
            errorReportedRef.current = true;
            const message = typeof status.error === 'string' ? status.error : 'Failed to play video';
            onError?.(message);
          }

          if (!status.error && errorReportedRef.current) {
            errorReportedRef.current = false;
          }

          onPlaybackStatusUpdate?.(status);
        }
      } catch (error) {
        console.warn('Video status error', error);
      }
    }, 400);

    return () => clearInterval(id);
  }, [player, onPlaybackStatusUpdate, onError]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: MAX_VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
});
