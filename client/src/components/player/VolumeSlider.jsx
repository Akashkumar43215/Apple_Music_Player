import { FiVolume2, FiVolumeX } from "react-icons/fi";

const VolumeSlider = ({
  volume = 1,
  muted = false,
  onVolumeChange,
  onMute,
}) => {
  return (
    <div className="flex items-center gap-3">

      <button
        onClick={onMute}
        className="text-white/70 transition hover:text-white"
      >
        {muted || volume === 0 ? (
          <FiVolumeX size={20} />
        ) : (
          <FiVolume2 size={20} />
        )}
      </button>

      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={muted ? 0 : volume}
        onChange={(e) =>
          onVolumeChange(Number(e.target.value))
        }
        className="range-slider w-28"
      />

    </div>
  );
};

export default VolumeSlider;