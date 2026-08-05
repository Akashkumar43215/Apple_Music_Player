import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { playlistService } from "../../services/playlistService";

const CreatePlaylistModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Playlist name is required");
      return;
    }

    try {
      setLoading(true);

      await playlistService.createPlaylist({
        name,
        description,
      });

      toast.success("Playlist created successfully");

      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Could not create playlist"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
          }}
          transition={{
            duration: 0.25,
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-3xl"
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-black text-white">
              Create Playlist
            </h2>

            <button
              onClick={onClose}
              className="rounded-full bg-white/5 p-3 transition hover:bg-white/10"
            >
              <FiX />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="mb-2 block text-sm text-white/60">
                Playlist Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="My Playlist"
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">
                Description
              </label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Optional description..."
                className="input-field resize-none"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 px-6 py-3 text-white hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-8"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreatePlaylistModal;