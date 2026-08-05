import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUploadCloud, FiMusic, FiImage } from "react-icons/fi";
import toast from "react-hot-toast";
import GenreDropdown from "../ui/GenreDropdown";
import { songService } from "../../services/songService";
import { GENRES } from "../../utils/constants";
import { getMediaUrl } from "../../utils/format";

const SongUploadModal = ({ song, onClose, onSuccess }) => {
  const isEditMode = !!song;

  const [formData, setFormData] = useState({
    title: song?.title || "",
    artist: song?.artist || "",
    album: song?.album || "",
    genre: song?.genre || "Other",
  });

  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [coverPreview, setCoverPreview] = useState(
    getMediaUrl(song?.coverUrl) || null,
  );

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAudioSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      !["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"].includes(
        file.type,
      )
    ) {
      toast.error("Please select an MP3 or WAV file");
      return;
    }

    setAudioFile(file);

    if (!formData.title) {
      setFormData((prev) => ({
        ...prev,
        title: file.name.replace(/\.(mp3|wav)$/i, ""),
      }));
    }
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Cover must be JPEG, PNG or WebP");
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const next = {};

    if (!formData.title.trim()) next.title = "Title is required";

    if (!formData.artist.trim()) next.artist = "Artist is required";

    if (!isEditMode && !audioFile) next.audio = "Audio file is required";

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await songService.updateSong(song._id, {
          ...formData,
          coverFile,
        });

        toast.success("Song updated");
      } else {
        await songService.uploadSong(
          {
            ...formData,
            audioFile,
            coverFile,
          },
          setProgress,
        );

        toast.success("Song uploaded");
      }

      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
      setProgress(0);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/80
          p-6
          backdrop-blur-md
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 30,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: 30,
          }}
          transition={{
            duration: 0.25,
          }}
          onClick={(e) => e.stopPropagation()}
          className="
            relative
            w-full
            max-w-2xl
            max-h-[92vh]
            overflow-y-auto
            rounded-[32px]
            border
            border-white/10
            bg-[#111118]/95
            p-8
            backdrop-blur-3xl
            shadow-[0_30px_80px_rgba(0,0,0,.55)]
          "
        >
          {/* Background Glow */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-violet-500/15 blur-[120px]" />

            <div className="absolute bottom-0 -left-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
          </div>

          <div className="relative">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[5px] text-white/30">
                  Library
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  {isEditMode ? "Edit Song" : "Upload Music"}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="rounded-full bg-white/5 p-3 transition hover:bg-white/10"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Audio Upload */}

              {!isEditMode && (
                <div>
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    className={`
        group
        flex
        w-full
        flex-col
        items-center
        justify-center
        rounded-3xl
        border-2
        border-dashed
        px-6
        py-12
        transition

        ${
          audioFile
            ? "border-violet-500 bg-violet-500/10"
            : "border-white/15 hover:border-violet-500/40 hover:bg-white/5"
        }
      `}
                  >
                    {audioFile ? (
                      <FiMusic className="mb-4 h-12 w-12 text-violet-400" />
                    ) : (
                      <FiUploadCloud className="mb-4 h-12 w-12 text-white/40 transition group-hover:scale-110" />
                    )}

                    <h3 className="text-lg font-semibold text-white">
                      {audioFile ? audioFile.name : "Drop your music here"}
                    </h3>

                    <p className="mt-2 text-sm text-white/40">
                      MP3 or WAV • Click to browse
                    </p>
                  </button>

                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/wav"
                    onChange={handleAudioSelect}
                    className="hidden"
                  />

                  {errors.audio && (
                    <p className="mt-2 text-sm text-red-400">{errors.audio}</p>
                  )}
                </div>
              )}

              {/* Cover */}

              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="
      h-24
      w-24
      overflow-hidden
      rounded-2xl
      border
      border-white/10
      bg-white/5
    "
                >
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FiImage className="text-3xl text-white/30" />
                    </div>
                  )}
                </button>

                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverSelect}
                  className="hidden"
                />

                <div>
                  <h3 className="font-semibold text-white">Album Artwork</h3>

                  <p className="mt-1 text-sm text-white/40">
                    Optional PNG, JPG or WEBP
                  </p>
                </div>
              </div>

              {/* Inputs */}

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-white/60">
                    Song Title
                  </label>

                  <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Perfect"
                    className="
        w-full
        rounded-2xl
        border
        border-white/10
        bg-white/5
        px-5
        py-4
        text-white
        placeholder:text-white/30
        outline-none
        transition
        focus:border-violet-500
      "
                  />

                  {errors.title && (
                    <p className="mt-2 text-red-400">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/60">
                    Artist
                  </label>

                  <input
                    id="artist"
                    name="artist"
                    value={formData.artist}
                    onChange={handleChange}
                    placeholder="Ed Sheeran"
                    className="
        w-full
        rounded-2xl
        border
        border-white/10
        bg-white/5
        px-5
        py-4
        text-white
        placeholder:text-white/30
        outline-none
        transition
        focus:border-violet-500
      "
                  />

                  {errors.artist && (
                    <p className="mt-2 text-red-400">{errors.artist}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-sm text-white/60">
                      Album
                    </label>

                    <input
                      id="album"
                      name="album"
                      value={formData.album}
                      onChange={handleChange}
                      placeholder="Single"
                      className="
          w-full
          rounded-2xl
          border
          border-white/10
          bg-white/5
          px-5
          py-4
          text-white
          outline-none
          focus:border-violet-500
        "
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-white/60">
                      Genre
                    </label>

                    <GenreDropdown
                      value={formData.genre}
                      options={GENRES}
                      onChange={(genre) =>
                        setFormData((prev) => ({
                          ...prev,
                          genre,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              
              {/* Upload Progress */}

              {isSubmitting && progress > 0 && (
                <div>
                  <div className="mb-2 flex justify-between text-sm text-white/50">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "easeOut" }}
                      className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-violet-500
                      via-fuchsia-500
                      to-cyan-400
                    "
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}

              <motion.button
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                type="submit"
                disabled={isSubmitting}
                className="
                mt-4
                flex
                w-full
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-r from-violet-600 to-cyan-500
                py-4
                text-lg
                font-semibold
                text-white
                shadow-2xl
                transition
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              >
                {isSubmitting
                  ? "Uploading..."
                  : isEditMode
                    ? "Save Changes"
                    : "Upload Song"}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SongUploadModal;
