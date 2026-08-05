/**
 * Grid of pulsing placeholder cards shown while songs are loading.
 * Matches the dimensions of SongCard so there's no layout shift on load.
 */
const SongGridSkeleton = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl bg-white/5 p-3">
          <div className="aspect-square w-full rounded-lg bg-white/10" />
          <div className="mt-3 h-3.5 w-3/4 rounded bg-white/10" />
          <div className="mt-2 h-3 w-1/2 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
};

export default SongGridSkeleton;
