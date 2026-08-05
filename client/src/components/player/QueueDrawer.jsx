// import { motion } from 'framer-motion';
// import { FiX, FiMusic, FiTrash2 } from 'react-icons/fi';
// import { usePlayer } from '../../hooks/usePlayer';
// import { getMediaUrl, formatDuration } from '../../utils/format';

// const QueueDrawer = ({ onClose }) => {
//   const { queue, jumpToQueueIndex, removeFromQueue } = usePlayer();

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ x: '100%' }}
//         animate={{ x: 0 }}
//         exit={{ x: '100%' }}
//         transition={{ type: 'spring', damping: 28, stiffness: 260 }}
//         onClick={(e) => e.stopPropagation()}
//         className="glass flex h-full w-full max-w-sm flex-col rounded-l-2xl p-5"
//       >
//         <div className="mb-4 flex items-center justify-between">
//           <h2 className="text-base font-bold text-white">Queue</h2>
//           <button onClick={onClose} aria-label="Close queue" className="text-white/50 hover:text-white">
//             <FiX className="h-5 w-5" />
//           </button>
//         </div>

//         <div className="flex-1 space-y-1 overflow-y-auto">
//           {queue.map(({ song, posInPlayOrder, isCurrent }) => {
//             const coverUrl = getMediaUrl(song.coverUrl);
//             return (
//               <div
//                 key={`${song._id}-${posInPlayOrder}`}
//                 className={`group flex items-center gap-3 rounded-lg p-2 transition-colors ${
//                   isCurrent ? 'bg-accent/15' : 'hover:bg-white/5'
//                 }`}
//               >
//                 <button
//                   onClick={() => jumpToQueueIndex(posInPlayOrder)}
//                   className="flex min-w-0 flex-1 items-center gap-3 text-left"
//                 >
//                   <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-background-tertiary">
//                     {coverUrl ? (
//                       <img src={coverUrl} alt={song.title} className="h-full w-full object-cover" />
//                     ) : (
//                       <div className="flex h-full w-full items-center justify-center">
//                         <FiMusic className="h-3.5 w-3.5 text-white/30" />
//                       </div>
//                     )}
//                   </div>
//                   <div className="min-w-0">
//                     <p className={`truncate text-sm ${isCurrent ? 'font-semibold text-accent-light' : 'text-white'}`}>
//                       {song.title}
//                     </p>
//                     <p className="truncate text-xs text-white/40">{song.artist}</p>
//                   </div>
//                 </button>
//                 <span className="shrink-0 text-xs text-white/30">{formatDuration(song.duration)}</span>
//                 {!isCurrent && (
//                   <button
//                     onClick={() => removeFromQueue(posInPlayOrder)}
//                     aria-label={`Remove ${song.title} from queue`}
//                     className="shrink-0 text-white/30 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
//                   >
//                     <FiTrash2 className="h-3.5 w-3.5" />
//                   </button>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default QueueDrawer;







import { motion } from "framer-motion";
import {
  FiX,
  FiMusic,
  FiTrash2,
  FiPlay,
} from "react-icons/fi";

import { usePlayer } from "../../hooks/usePlayer";
import { getMediaUrl, formatDuration } from "../../utils/format";

const QueueDrawer = ({ onClose }) => {
  const {
    queue,
    jumpToQueueIndex,
    removeFromQueue,
  } = usePlayer();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{
          type: "spring",
          stiffness: 240,
          damping: 28,
        }}
        onClick={(e) => e.stopPropagation()}
        className="
          absolute
          right-0
          top-0
          flex
          h-full
          w-full
          max-w-md
          flex-col
          overflow-hidden
          border-l
          border-white/10
          bg-[#111118]/95
          backdrop-blur-3xl
        "
      >
        {/* Background Glow */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-violet-500/15 blur-[120px]" />

          <div className="absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

        </div>

        {/* Header */}

        <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-5">

          <div>

            <p className="text-xs uppercase tracking-[4px] text-white/30">
              Player
            </p>

            <h2 className="mt-1 text-2xl font-bold text-white">
              Queue
            </h2>

          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 transition hover:bg-white/10"
          >
            <FiX size={20} />
          </button>

        </div>

        {/* Empty */}

        {queue.length === 0 && (
          <div className="relative flex flex-1 flex-col items-center justify-center text-center">

            <FiMusic className="mb-5 text-6xl text-white/20" />

            <h3 className="text-xl font-semibold">
              Queue is Empty
            </h3>

            <p className="mt-2 text-white/40">
              Play a song to start your queue.
            </p>

          </div>
        )}

        {/* Queue */}

        <div className="relative flex-1 space-y-2 overflow-y-auto p-4">

          {queue.map(({ song, posInPlayOrder, isCurrent }, index) => {

            const cover = getMediaUrl(song.coverUrl);

            return (

              <motion.div
                key={`${song._id}-${posInPlayOrder}`}
                layout
                whileHover={{ scale: 1.02 }}
                className={`
                  group
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  p-3
                  transition

                  ${
                    isCurrent
                      ? "border-violet-500/40 bg-violet-500/10"
                      : "border-transparent bg-white/5 hover:bg-white/10"
                  }
                `}
              >
                {/* Number */}

                <div className="w-6 text-center text-sm text-white/40">
                  {index + 1}
                </div>

                {/* Artwork */}

                <button
                  onClick={() => jumpToQueueIndex(posInPlayOrder)}
                  className="flex flex-1 items-center gap-4 text-left"
                >
                  <div className="h-14 w-14 overflow-hidden rounded-xl bg-white/5">

                    {cover ? (
                      <img
                        src={cover}
                        alt={song.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FiMusic className="text-white/30" />
                      </div>
                    )}

                  </div>

                  <div className="min-w-0 flex-1">

                    <h4
                      className={`truncate font-semibold ${
                        isCurrent
                          ? "text-violet-300"
                          : "text-white"
                      }`}
                    >
                      {song.title}
                    </h4>

                    <p className="truncate text-sm text-white/50">
                      {song.artist}
                    </p>

                    <p className="mt-1 text-xs text-white/30">
                      {formatDuration(song.duration)}
                    </p>

                  </div>
                </button>

                {/* Now Playing */}

                {isCurrent ? (
                  <div className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-300">
                    <FiPlay className="mr-1 inline" />
                    Playing
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      removeFromQueue(posInPlayOrder)
                    }
                    className="opacity-0 transition group-hover:opacity-100"
                  >
                    <FiTrash2 className="text-white/40 hover:text-red-400" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QueueDrawer;