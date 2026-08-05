import { createContext, useState, useRef, useEffect, useCallback } from 'react';
import { getMediaUrl } from '../utils/format';
import { recentlyPlayedService } from '../services/recentlyPlayedService';

export const PlayerContext = createContext(null);

// Fisher-Yates shuffle of an index array, keeping `keepFirst` fixed at position 0
// so the currently-playing song doesn't jump when shuffle is turned on.
const shuffleIndices = (length, keepFirst) => {
  const rest = Array.from({ length }, (_, i) => i).filter((i) => i !== keepFirst);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return keepFirst === null ? rest : [keepFirst, ...rest];
};

/**
 * Owns the single <audio> element for the whole app (mounted once in
 * PlayerProvider, never remounted per-page) so playback survives navigation.
 * All player UI (PlayerBar, QueueDrawer, SongCard play buttons) reads and
 * controls playback exclusively through this context.
 */
export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  if (!audioRef.current && typeof Audio !== 'undefined') {
    audioRef.current = new Audio();
  }

  const [queue, setQueue] = useState([]); // original, unshuffled order
  const [playOrder, setPlayOrder] = useState([]); // array of indices into `queue`
  const [currentIndex, setCurrentIndex] = useState(0); // position within playOrder

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [isLoading, setIsLoading] = useState(false);

  const lastRecordedIdRef = useRef(null);

  const currentSong = playOrder.length > 0 ? queue[playOrder[currentIndex]] : null;

  // Keep the <audio> element's volume/mute in sync with state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Load a new source whenever the current song changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    setIsLoading(true);
    audio.src = getMediaUrl(currentSong.audioUrl);
    audio.load();
    lastRecordedIdRef.current = null;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?._id]);

  const playNext = useCallback(() => {
    if (playOrder.length === 0) return;

    if (repeatMode === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      return;
    }

    const nextPos = currentIndex + 1;
    if (nextPos >= playOrder.length) {
      if (repeatMode === 'all') {
        setCurrentIndex(0);
        setIsPlaying(true);
      } else {
        setIsPlaying(false); // reached the end of the queue, stop
      }
      return;
    }
    setCurrentIndex(nextPos);
    setIsPlaying(true);
  }, [playOrder.length, currentIndex, repeatMode]);

  const playPrevious = useCallback(() => {
    const audio = audioRef.current;
    // Standard UX: if more than 3s into the song, restart it instead of
    // going to the previous track
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prevPos = currentIndex - 1;
    if (prevPos < 0) {
      if (repeatMode === 'all') {
        setCurrentIndex(playOrder.length - 1);
      } else if (audio) {
        audio.currentTime = 0;
      }
      return;
    }
    setCurrentIndex(prevPos);
    setIsPlaying(true);
  }, [currentIndex, playOrder.length, repeatMode]);

  // Wire up native audio element events once
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Count a play after 3s of listening (avoids logging accidental clicks)
      if (
        currentSong &&
        audio.currentTime > 3 &&
        lastRecordedIdRef.current !== currentSong._id
      ) {
        lastRecordedIdRef.current = currentSong._id;
        recentlyPlayedService.recordPlay(currentSong._id).catch(() => {});
      }
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => playNext();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong, playNext]);

  /**
   * Starts playing `song`, setting `songList` (defaults to just the one
   * song) as the queue. If the song is already in the current queue, jumps
   * to it instead of resetting the whole queue.
   */
  const playSong = useCallback(
    (song, songList) => {
      const list = songList && songList.length > 0 ? songList : [song];
      const originalIndex = list.findIndex((s) => s._id === song._id);

      setQueue(list);
      const order = isShuffled ? shuffleIndices(list.length, originalIndex) : list.map((_, i) => i);
      setPlayOrder(order);
      setCurrentIndex(order.indexOf(originalIndex));
      setIsPlaying(true);
    },
    [isShuffled]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying, currentSong]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    if (v > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prevShuffled) => {
      const next = !prevShuffled;
      if (queue.length > 0) {
        const currentOriginalIndex = playOrder[currentIndex];
        const order = next
          ? shuffleIndices(queue.length, currentOriginalIndex)
          : queue.map((_, i) => i);
        setPlayOrder(order);
        setCurrentIndex(order.indexOf(currentOriginalIndex));
      }
      return next;
    });
  }, [queue.length, playOrder, currentIndex]);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  }, []);

  const jumpToQueueIndex = useCallback((posInPlayOrder) => {
    setCurrentIndex(posInPlayOrder);
    setIsPlaying(true);
  }, []);

  const removeFromQueue = useCallback(
    (posInPlayOrder) => {
      if (posInPlayOrder === currentIndex) return; // can't remove the playing song
      const originalIndexToRemove = playOrder[posInPlayOrder];
      const newQueue = queue.filter((_, i) => i !== originalIndexToRemove);
      const newOrder = playOrder
        .filter((_, i) => i !== posInPlayOrder)
        .map((idx) => (idx > originalIndexToRemove ? idx - 1 : idx));
      const newCurrentOriginal = playOrder[currentIndex] > originalIndexToRemove ? playOrder[currentIndex] - 1 : playOrder[currentIndex];
      setQueue(newQueue);
      setPlayOrder(newOrder);
      setCurrentIndex(newOrder.indexOf(newCurrentOriginal));
    },
    [queue, playOrder, currentIndex]
  );

  // The upcoming queue in actual playback order, for the QueueDrawer
  const upcomingQueue = playOrder.map((originalIdx, pos) => ({
    song: queue[originalIdx],
    posInPlayOrder: pos,
    isCurrent: pos === currentIndex,
  }));

  const value = {
    currentSong,
    queue: upcomingQueue,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    playSong,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    jumpToQueueIndex,
    removeFromQueue,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};
