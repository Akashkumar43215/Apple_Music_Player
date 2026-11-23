import { useState, useEffect, useCallback } from "react";
// import { motion } from "framer-motion";
// import { FiPlus, FiLogOut, FiMusic } from "react-icons/fi";
import { FiMusic } from "react-icons/fi";
import HorizontalSongRow from "../components/library/HorizontalSongRow";
import { usePlayer } from "../hooks/usePlayer";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useDebounce } from "../hooks/useDebounce";
import { songService } from "../services/songService";
import { recentlyPlayedService } from "../services/recentlyPlayedService";
import SongCard from "../components/song/SongCard";
import SongGridSkeleton from "../components/song/SongGridSkeleton";
import SongFilterBar from "../components/song/SongFilterBar";
import SongUploadModal from "../components/song/SongUploadModal";
import RecentlyPlayedStrip from "../components/song/RecentlyPlayedStrip";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import HeroSection from "../components/library/HeroSection";
import ContinueListening from "../components/library/ContinueListening";
import GenreSection from "../components/library/GenreSection";

const LibraryPage = () => {
  // const { user, logout } = useAuth();
  const { user } = useAuth();
  const { playSong } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [sort, setSort] = useState("newest");
  const [popular, setPopular] = useState([]); // top songs overall, for Trending and "no results" suggestions
  const debouncedSearch = useDebounce(search, 400);

  const [filterOptions, setFilterOptions] = useState({
    artists: [],
    albums: [],
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [deletingSong, setDeletingSong] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Trending = most played across the whole library (not just the current page), and only songs actually played.
  const trendingSongs = popular.filter((s) => s.playCount > 0);

  const romanticSongs = songs.filter(
  (song) => song.genre === "💕 Romantic"
);

const sadSongs = songs.filter(
  (song) => song.genre === "💔 Heartbreak"
);

const workoutSongs = songs.filter(
  (song) => song.genre === "🏋️ Workout"
);

  const handlePlaySong = (song, list = songs) => {
    if (!song) return;
    playSong(song, list);
  };

  const fetchSongs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await songService.getSongs({
        search: debouncedSearch || undefined,
        genre: genre || undefined,
        artist: artist || undefined,
        album: album || undefined,
        sort,
        page,
        limit: 20,
      });
      setSongs(data.songs);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error("Could not load songs");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, genre, artist, album, sort, page]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genre, artist, album, sort]);

  useEffect(() => {
    songService
      .getSongs({ sort: "popular", limit: 10 })
      .then((data) => setPopular(data.songs))
      .catch(() => {});
  }, []);

  const fetchFilterOptions = useCallback(() => {
    songService
      .getFilterOptions()
      .then((data) =>
        setFilterOptions({ artists: data.artists, albums: data.albums }),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    recentlyPlayedService
      .getRecentlyPlayed(10)
      .then((data) => setRecentlyPlayed(data.songs))
      .catch(() => {});
  }, []);

  const handleClearFilters = () => {
    setGenre("");
    setArtist("");
    setAlbum("");
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await songService.deleteSong(deletingSong._id);
      toast.success("Song deleted");
      setDeletingSong(null);
      fetchSongs();
      fetchFilterOptions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete song");
    } finally {
      setIsDeleting(false);
    }
  };

  const hasFilters = Boolean(debouncedSearch || genre || artist || album);

  return (
    <div className="min-h-screen bg-gradient-dark pb-16">
      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6">
        <>
          {/* <HeroSection
            user={user}
            song={recentlyPlayed[0]}
            totalSongs={total}
            onUpload={() => setShowUploadModal(true)}
            onPlay={() => {}}
          />

          <ContinueListening song={recentlyPlayed[0]} onPlay={() => {}} /> */}

          <HeroSection
            user={user}
            song={recentlyPlayed[0]}
            totalSongs={total}
            onUpload={() => setShowUploadModal(true)}
            onPlay={() => handlePlaySong(recentlyPlayed[0], recentlyPlayed)}
          />

          <ContinueListening
            song={recentlyPlayed[0]}
            onPlay={() => handlePlaySong(recentlyPlayed[0], recentlyPlayed)}
          />

          {/* <GenreSection /> */}
          <GenreSection
            onSelectGenre={(selectedGenre) => {
              setGenre(selectedGenre);
              setPage(1);
              // The filtered list is further down the page; bring it into view.
              document.getElementById("song-list")?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </>

        <HorizontalSongRow
          title="Trending"
          songs={trendingSongs}
          onEdit={setEditingSong}
          onDelete={setDeletingSong}
        />

        <HorizontalSongRow
          title="Romantic"
          songs={romanticSongs}
          onEdit={setEditingSong}
          onDelete={setDeletingSong}
        />

        <HorizontalSongRow
          title="Heartbreak"
          songs={sadSongs}
          onEdit={setEditingSong}
          onDelete={setDeletingSong}
        />

        <HorizontalSongRow
          title="Workout"
          songs={workoutSongs}
          onEdit={setEditingSong}
          onDelete={setDeletingSong}
        />

        <RecentlyPlayedStrip songs={recentlyPlayed} />

        <div id="song-list" className="mb-6">
          <SongFilterBar
            search={search}
            onSearchChange={setSearch}
            genre={genre}
            onGenreChange={setGenre}
            artist={artist}
            onArtistChange={setArtist}
            album={album}
            onAlbumChange={setAlbum}
            artistOptions={filterOptions.artists}
            albumOptions={filterOptions.albums}
            onClearFilters={handleClearFilters}
            sort={sort}
            onSortChange={setSort}
          />
        </div>

        {isLoading ? (
          <SongGridSkeleton />
        ) : songs.length === 0 ? (
          <>
          <EmptyState
            icon={FiMusic}
            title={
              hasFilters
                ? "No songs match your filters"
                : "Your library is empty"
            }
            message={
              hasFilters
                ? "Try a different search term or clear your filters."
                : "Upload your first track to start building your collection."
            }
            actionLabel={hasFilters ? "Clear filters" : "Upload a song"}
            onAction={
              hasFilters ? handleClearFilters : () => setShowUploadModal(true)
            }
          />
          {hasFilters && popular.length > 0 && (
            <section className="mt-8">
              <h3 className="mb-4 text-lg font-bold text-white">You might like</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {popular.slice(0, 5).map((song) => (
                  <SongCard
                    key={song._id}
                    song={song}
                    songList={popular}
                    onEdit={setEditingSong}
                    onDelete={setDeletingSong}
                  />
                ))}
              </div>
            </section>
          )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {songs.map((song) => (
                <SongCard
                  key={song._id}
                  song={song}
                  songList={songs}
                  onEdit={setEditingSong}
                  onDelete={setDeletingSong}
                />
              ))}
            </div>

            {pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-sm text-white/50">
                  Page {page} of {pages}
                </span>
                <button
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {showUploadModal && (
        <SongUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchSongs();
            fetchFilterOptions();
          }}
        />
      )}

      {editingSong && (
        <SongUploadModal
          song={editingSong}
          onClose={() => setEditingSong(null)}
          onSuccess={() => {
            setEditingSong(null);
            fetchSongs();
            fetchFilterOptions();
          }}
        />
      )}

      {deletingSong && (
        <ConfirmDialog
          title="Delete this song?"
          message={`"${deletingSong.title}" will be permanently removed from the library.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingSong(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default LibraryPage;
