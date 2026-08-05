import { formatDuration } from "../../utils/format";

const ProgressBar = ({
  currentTime = 0,
  duration = 0,
  onSeek,
}) => {
  return (
    <div className="flex w-full items-center gap-3">

      <span
        className="
          w-12
          text-right
          text-xs
          text-white/50
        "
      >
        {formatDuration(currentTime)}
      </span>

      <input
        type="range"
        min={0}
        max={duration || 0}
        value={currentTime}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="
          range-slider
          flex-1
        "
      />

      <span
        className="
          w-12
          text-xs
          text-white/50
        "
      >
        {formatDuration(duration)}
      </span>

    </div>
  );
};

export default ProgressBar;