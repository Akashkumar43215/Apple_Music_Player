import { motion } from "framer-motion";
import {
  FiMusic,
  FiGrid,
  FiHeart,
  FiClock,
} from "react-icons/fi";

const stats = [
  {
    label: "Songs",
    icon: FiMusic,
    color: "text-violet-400",
  },
  {
    label: "Genres",
    icon: FiGrid,
    color: "text-cyan-400",
  },
  {
    label: "Favorites",
    icon: FiHeart,
    color: "text-pink-400",
  },
  {
    label: "Recently Played",
    icon: FiClock,
    color: "text-green-400",
  },
];

const LibraryStats = ({
  totalSongs = 0,
  totalGenres = 0,
  totalFavorites = 0,
  recentlyPlayed = 0,
}) => {
  const values = [
    totalSongs,
    totalGenres,
    totalFavorites,
    recentlyPlayed,
  ];

  return (
    <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
            }}
            className="
              group
              rounded-3xl
              border
              border-white/10
              bg-white/5
              p-5
              backdrop-blur-xl
              transition-all
              duration-300
              hover:-translate-y-1
              hover:bg-white/10
            "
          >
            <div className="flex items-center justify-between">
              <Icon
                className={`${item.color} text-2xl`}
              />

              <span className="text-3xl font-black text-white">
                {values[index]}
              </span>
            </div>

            <p className="mt-4 text-sm text-white/55">
              {item.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LibraryStats;