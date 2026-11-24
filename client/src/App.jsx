const PlaylistsPage = lazy(() => import("./pages/PlaylistsPage"));
const PlaylistDetails = lazy(() => import("./pages/PlaylistDetails"));
const StatsPage = lazy(() => import("./pages/StatsPage"));
const BrowsePage = lazy(() => import("./pages/BrowsePage"));
const RecentlyPlayedPage = lazy(() => import("./pages/RecentlyPlayedPage"));
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import LibraryPage from "./pages/LibraryPage";
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFoundPage from "./pages/NotFoundPage";

import ProtectedRoute from "./components/common/ProtectedRoute";
import GuestRoute from "./components/common/GuestRoute";

import MainLayout from "./layouts/MainLayout";
import ServerStatus from "./components/common/ServerStatus";
import Spinner from "./components/common/Spinner";

function App() {
  return (
    <>
      <ServerStatus />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#121216",
            color: "#fff",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "18px",
          },
        }}
      />

      <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Guest Routes */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <MainLayout>
                <LibraryPage />
              </MainLayout>
            }
          />

          <Route
            path="/favorites"
            element={
              <MainLayout>
                <FavoritesPage />
              </MainLayout>
            }
          />

          <Route
            path="/playlists"
            element={
              <MainLayout>
                <PlaylistsPage />
              </MainLayout>
            }
          />

          <Route
            path="/recently-played"
            element={<MainLayout><RecentlyPlayedPage /></MainLayout>}

          />

          <Route
            path="/albums"
            element={<MainLayout><BrowsePage kind="album" /></MainLayout>}

          />

          <Route
            path="/artists"
            element={<MainLayout><BrowsePage kind="artist" /></MainLayout>}

          />


          <Route
            path="/stats"
            element={
              <MainLayout>
                <StatsPage />
              </MainLayout>
            }
          />

          <Route
            path="/playlists/:id"
            element={
              <MainLayout>
                <PlaylistDetails />
              </MainLayout>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </>
  );
}

export default App;
