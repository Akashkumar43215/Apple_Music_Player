import {
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiRepeat,
  FiShuffle,
} from "react-icons/fi";

const PlaybackButtons = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  shuffle,
  repeat,
  onToggleShuffle,
  onToggleRepeat,
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">

        {/* Shuffle */}

        <button
          onClick={onToggleShuffle}
          className={`
            relative
            transition-all
            duration-300
            hover:scale-110
            ${
              shuffle
                ? "text-violet-400"
                : "text-white/50 hover:text-white"
            }
          `}
        >
          <FiShuffle size={20} />
        </button>

        {/* Previous */}

        <button
          onClick={onPrevious}
          className="
            text-white
            transition-all
            duration-300
            hover:scale-110
          "
        >
          <FiSkipBack size={24} />
        </button>

        {/* Play / Pause */}

        <button
          onClick={onPlayPause}
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-white
            text-black
            shadow-xl
            transition-all
            duration-300
            hover:scale-110
            active:scale-95
          "
        >
          {isPlaying ? (
            <FiPause size={26} />
          ) : (
            <FiPlay
              size={26}
              className="ml-1"
            />
          )}
        </button>

        {/* Next */}

        <button
          onClick={onNext}
          className="
            text-white
            transition-all
            duration-300
            hover:scale-110
          "
        >
          <FiSkipForward size={24} />
        </button>

        {/* Repeat */}

        <button
          onClick={onToggleRepeat}
          className={`
            relative
            transition-all
            duration-300
            hover:scale-110
            ${
              repeat !== "off"
                ? "text-violet-400"
                : "text-white/50 hover:text-white"
            }
          `}
        >
          <FiRepeat size={20} />

          {repeat === "one" && (
            <span
              className="
                absolute
                -right-2
                -top-2
                flex
                h-4
                w-4
                items-center
                justify-center
                rounded-full
                bg-violet-500
                text-[10px]
                font-bold
                text-white
              "
            >
              1
            </span>
          )}
        </button>

      </div>
    </div>
  );
};

export default PlaybackButtons;