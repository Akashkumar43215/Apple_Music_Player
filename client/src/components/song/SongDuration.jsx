import { FiClock } from "react-icons/fi";
import { formatDuration } from "../../utils/format";

const SongDuration = ({ duration }) => {
  return (
    <div className="mt-3 flex items-center justify-between">
      <div className="flex items-center gap-1 text-white/35">
        <FiClock className="text-xs" />

        <span className="text-xs">
          {formatDuration(duration)}
        </span>
      </div>
    </div>
  );
};

export default SongDuration;