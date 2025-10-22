import { CONFIG } from '@/core/config';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnail?: string;
  isActive: boolean;
  onPlaybackStatusUpdate?: (status: any) => void;
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
  const [showControls, setShowControls] = useState(false);
  // desiredPlay controls whether we instruct the player to play
  const [desiredPlay, setDesiredPlay] = useState(false);
  // key to force remount VideoView when native view gets into a bad state (e.g., after fullscreen exit)
  const [videoKey, setVideoKey] = useState(0);

  // create player for this video source
  const player: any = useVideoPlayer(videoUrl, (p: any) => {
    try {
      p.muted = CONFIG.VIDEO.MUTED_BY_DEFAULT;
      p.loop = false;
    } catch {
      // ignore
    }
  });

  // Update desired play state when active changes. We use declarative
  // `shouldPlay` prop on the <Video /> component instead of calling
  // imperative playAsync/pauseAsync which can throw if the native view
  // hasn't been registered yet.
  useEffect(() => {
    setDesiredPlay(isActive && CONFIG.VIDEO.AUTO_PLAY);
  }, [isActive]);

  // When desiredPlay changes, control the native player.
  useEffect(() => {
    if (!player) return;
    (async () => {
      try {
        if (desiredPlay) {
          await player.play();
        } else {
          await player.pause();
        }
      } catch (error) {
        console.error('Player control error:', error);
        onError?.('Failed to control playback');
      }
    })();
  }, [desiredPlay, player, onError]);

  // Poll player for status (duration/currentTime)
  useEffect(() => {
    if (!player) return;
    const update = () => {
      try {
        const status = (player.status as any) || null;
        onPlaybackStatusUpdate?.(status);
        // try to pick up video track size to calculate aspect ratio
        try {
          const tracks = player.availableVideoTracks || [];
          if (tracks.length > 0 && tracks[0].size) {
            const s = tracks[0].size;
            if (s.width && s.height) {
              setVideoAspect(s.width / s.height);
            }
          }
        } catch {
          // ignore
        }
      } catch {
        // ignore
      }
    };
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [player, onPlaybackStatusUpdate]);

  const [videoAspect, setVideoAspect] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={() => setShowControls(!showControls)}
      >
        <VideoView
          key={videoKey}
          player={player}
          style={[
            styles.video,
            videoAspect
              ? { height: Math.min(screenWidth / videoAspect, screenHeight * 0.9) }
              : {}
          ]}
          contentFit="cover"
          fullscreenOptions={{ enable: true, orientation: 'landscapeRight' }}
          onFullscreenEnter={() => setShowControls(false)}
          onFullscreenExit={() => {
            // force remount and try to restore playback after a short delay
            setVideoKey((k) => k + 1);
            setTimeout(() => setDesiredPlay(true), 50);
          }}
        />
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
