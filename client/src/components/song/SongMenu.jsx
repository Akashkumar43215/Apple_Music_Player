import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import AddToPlaylistModal from "../playlist/AddToPlaylistModal";

const SongMenu = ({ song, onEdit, onDelete }) => {
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  return (
    <>
      <div
        className="
          absolute
          left-3
          top-3
          flex
          gap-2
          opacity-0
          transition-all
          duration-300
          group-hover:opacity-100
        "
      >
        {/* Edit */}
        <button
          onClick={() => onEdit(song)}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-black/60
            backdrop-blur-xl
            transition
            hover:bg-white/20
          "
        >
          <FiEdit2 size={15} />
        </button>

        {/* Add to Playlist */}
        <button
          onClick={() => setShowPlaylistModal(true)}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-black/60
            backdrop-blur-xl
            transition
            hover:bg-violet-500
          "
        >
          <FiPlus size={15} />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(song)}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-black/60
            backdrop-blur-xl
            transition
            hover:bg-red-500
          "
        >
          <FiTrash2 size={15} />
        </button>
      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal
          songId={song._id}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </>
  );
};

export default SongMenu;
