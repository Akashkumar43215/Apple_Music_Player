import { motion } from "framer-motion";
import {
  FiHeart,
  FiMoon,
  FiCoffee,
  FiActivity,
  FiTrendingUp,
  FiMusic,
} from "react-icons/fi";

const genres = [
  {
    title: "Romantic",
    value: "💕 Romantic",
    subtitle: "Love & Feelings",
    color: "from-pink-500 to-rose-600",
    icon: FiHeart,
  },
  {
    title: "Sad",
    value: "💔 Sad",
    subtitle: "Emotional Songs",
    color: "from-blue-500 to-indigo-600",
    icon: FiMoon,
  },
  {
    title: "Party",
    value: "🎉 Party",
    subtitle: "Dance Hits",
    color: "from-orange-400 to-pink-500",
    icon: FiMusic,
  },
  {
    title: "Chill",
    value: "😌 Chill",
    subtitle: "Relax & Focus",
    color: "from-cyan-500 to-sky-600",
    icon: FiCoffee,
  },
  {
    title: "Road Trip",
    value: "🚗 Road Trip",
    subtitle: "Travel Vibes",
    color: "from-yellow-400 to-orange-500",
    icon: FiTrendingUp,
  },
  {
    title: "Night",
    value: "🌙 Night",
    subtitle: "Late Night Mix",
    color: "from-slate-700 to-black",
    icon: FiMoon,
  },
  {
    title: "Workout",
    value: "💪 Workout",
    subtitle: "Power Energy",
    color: "from-green-500 to-emerald-700",
    icon: FiActivity,
  },
  {
    title: "Trending",
    value: "",
    subtitle: "Most Played",
    color: "from-violet-500 to-fuchsia-600",
    icon: FiTrendingUp,
  },
];

const GenreSection = ({ onSelectGenre }) => {
  return (
    <section className="mb-16">

      <div className="mb-8">

        <h2 className="text-3xl font-black text-white">
          Browse by Mood
        </h2>

        <p className="mt-2 text-white/40">
          Discover playlists based on your mood.
        </p>

      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">

        {genres.map((genre, index) => {
          const Icon = genre.icon;

          return (
            <motion.button
              key={genre.title}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.05,
              }}
              whileHover={{
                scale: 1.04,
                y: -6,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={() => onSelectGenre?.(genre.value)}
              className={`
                group
                relative
                overflow-hidden
                rounded-[30px]
                bg-gradient-to-br
                ${genre.color}
                p-6
                text-left
                shadow-2xl
              `}
            >
              {/* Glow */}

              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" />

              {/* Icon */}

              <div
                className="
                  mb-8
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/15
                  backdrop-blur-xl
                "
              >
                <Icon size={24} />
              </div>

              {/* Text */}

              <h3 className="text-2xl font-black text-white">
                {genre.title}
              </h3>

              <p className="mt-2 text-sm text-white/70">
                {genre.subtitle}
              </p>

              {/* Hover Arrow */}

              <motion.div
                className="
                  absolute
                  bottom-5
                  right-5
                  text-2xl
                  opacity-0
                  transition-all
                  duration-300
                  group-hover:opacity-100
                "
              >
                →
              </motion.div>

            </motion.button>
          );
        })}

      </div>
    </section>
  );
};

export default GenreSection;