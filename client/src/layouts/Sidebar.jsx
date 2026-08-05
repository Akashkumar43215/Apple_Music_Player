import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiList,
  FiClock,
  FiHeart,
  FiDisc,
  FiUsers,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

const menuItems = [
  {
    title: "Library",
    icon: FiHome,
    path: "/",
  },
  {
    title: "Recently Played",
    icon: FiClock,
    path: "/recently-played",
  },
  {
    title: "Favorites",
    icon: FiHeart,
    path: "/favorites",
  },
  {
    title: "Playlists",
    icon: FiList,
    path: "/playlists",
  },
  {
    title: "Albums",
    icon: FiDisc,
    path: "/albums",
  },
  {
    title: "Artists",
    icon: FiUsers,
    path: "/artists",
  },
];

const Sidebar = () => {
  return (
    <aside
      className="
        hidden
        h-screen
        w-72
        flex-col
        border-r
        border-white/10
        bg-white/5
        backdrop-blur-3xl
        lg:flex
      "
    >
      {/* Logo */}
      <div className="border-b border-white/10 p-8">
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            bg-gradient-brand
            bg-clip-text
            text-4xl
            font-black
            text-transparent
          "
        >
          Music
        </motion.h1>

        <p className="mt-2 text-sm text-white/40">Apple Inspired Player</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8">
        <p className="mb-4 px-4 text-xs uppercase tracking-[4px] text-white/30">
          Browse
        </p>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink key={item.title} to={item.path}>
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
            flex
            w-full
            items-center
            gap-4
            rounded-2xl
            px-5
            py-4
            transition
            ${
              isActive
                ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-xl"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }
          `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.title}</span>
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Profile Card */}
      <div className="mx-4 mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-gradient-to-r
              from-violet-600
              to-cyan-500
              text-lg
              font-bold
              text-white
            "
          >
            A
          </div>

          <div>
            <h3 className="font-semibold text-white">Akash Kumar</h3>

            <p className="text-sm text-white/40">Premium Listener</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div>
            <h4 className="font-bold text-white">248</h4>

            <p className="text-xs text-white/40">Songs</p>
          </div>

          <div>
            <h4 className="font-bold text-white">18</h4>

            <p className="text-xs text-white/40">Albums</p>
          </div>

          <div>
            <h4 className="font-bold text-white">42</h4>

            <p className="text-xs text-white/40">Artists</p>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="border-t border-white/10 p-4">
        <button
          className="
            flex
            w-full
            items-center
            gap-4
            rounded-2xl
            px-5
            py-4
            text-white/60
            transition
            hover:bg-white/10
            hover:text-white
          "
        >
          <FiSettings size={20} />
          <span>Settings</span>
        </button>

        <button
          className="
            mt-2
            flex
            w-full
            items-center
            gap-4
            rounded-2xl
            px-5
            py-4
            text-red-400
            transition
            hover:bg-red-500/10
          "
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
