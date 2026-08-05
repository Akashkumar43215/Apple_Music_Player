import { FiMusic } from "react-icons/fi";
import { getMediaUrl } from "../../utils/format";

const AlbumArtwork = ({
  src,
  alt = "Album Artwork",
  size = "md",
  className = "",
}) => {
  const sizes = {
    sm: "h-16 w-16",
    md: "h-40 w-40",
    lg: "h-72 w-72",
    xl: "h-[420px] w-[420px]",
  };

  return (
    <div
      className={`
        group
        relative
        overflow-hidden
        rounded-[28px]
        bg-[#17171f]
        shadow-2xl
        ${sizes[size]}
        ${className}
      `}
    >
      {src ? (
        <img
          src={getMediaUrl(src)}
          alt={alt}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-110
          "
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
          <FiMusic className="text-6xl text-white/30" />
        </div>
      )}

      {/* Glass Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
    </div>
  );
};

export default AlbumArtwork;