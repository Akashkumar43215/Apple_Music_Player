import { motion } from "framer-motion";
import {
  FiBell,
  FiSearch,
  FiUpload,
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning ☀️";
  if (hour < 17) return "Good Afternoon 🌤️";
  return "Good Evening 🌙";
};

const TopBar = () => {
  const { user } = useAuth();

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/20 backdrop-blur-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">

        {/* Left */}

        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {getGreeting()}
          </h2>

          <p className="mt-1 hidden text-sm text-white/50 sm:block">
            Welcome back, {user?.name || "Music Lover"}.
          </p>
        </motion.div>

        {/* Right */}

        <div className="flex flex-1 items-center justify-end gap-3">

          {/* Search */}

          <motion.div
            whileFocus={{ scale: 1.02 }}
            className="
              hidden
              md:flex
              h-12
              w-full
              max-w-md
              items-center
              rounded-full
              border
              border-white/10
              bg-white/5
              px-5
              backdrop-blur-xl
            "
          >
            <FiSearch className="text-white/40" />

            <input
              placeholder="Search songs, artists..."
              className="
                ml-3
                flex-1
                bg-transparent
                text-white
                placeholder:text-white/40
                outline-none
              "
            />
          </motion.div>

          {/* Upload */}

          <button
            className="
              hidden
              sm:flex
              items-center
              gap-2
              rounded-full
              bg-gradient-to-r
              from-violet-600
              to-cyan-500
              px-5
              py-3
              font-medium
              text-white
              shadow-xl
              transition
              hover:scale-105
            "
          >
            <FiUpload />
            Upload
          </button>

          {/* Mobile Search */}

          <button
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-white/5
              md:hidden
            "
          >
            <FiSearch />
          </button>

          {/* Notification */}

          <button
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-white/5
              transition
              hover:bg-white/10
            "
          >
            <FiBell />
          </button>

          {/* Avatar */}

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-gradient-to-r
              from-violet-600
              to-cyan-500
              font-bold
              text-white
              shadow-lg
            "
          >
            {initials}
          </div>

        </div>

      </div>
    </header>
  );
};

export default TopBar;
