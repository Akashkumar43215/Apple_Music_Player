import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import PlayerBar from "../components/player/PlayerBar";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">

      {/* Background Glow */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-violet-600/20 blur-[160px]" />

        <div className="absolute right-[-180px] top-40 h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[160px]" />

        <div className="absolute bottom-[-200px] left-1/3 h-[450px] w-[450px] rounded-full bg-fuchsia-500/10 blur-[180px]" />

      </div>

      {/* Mobile Sidebar */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="h-full w-72"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />

            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-5 top-5 rounded-full bg-white/10 p-2"
            >
              <FiX size={22} />
            </button>
          </div>
        </div>
      )}

      <div className="relative flex">

        {/* Desktop Sidebar */}

        <div className="hidden lg:block">

          <Sidebar />

        </div>

        {/* Main */}

        <div className="flex min-h-screen flex-1 flex-col overflow-hidden">

          {/* Mobile Menu Button */}

          <div className="sticky top-0 z-40 flex h-16 items-center border-b border-white/10 bg-black/20 px-4 backdrop-blur-xl lg:hidden">

            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-full bg-white/10 p-2"
            >
              <FiMenu size={22} />
            </button>

            <h1 className="ml-4 text-lg font-bold">
              Music
            </h1>

          </div>

          <TopBar />

          <main
            className="
              flex-1
              overflow-y-auto
              px-4
              py-6
              pb-44
              sm:px-6
              lg:px-10
              xl:px-12
            "
          >
            {children}
          </main>

        </div>

      </div>

      <PlayerBar />

    </div>
  );
};

export default MainLayout;