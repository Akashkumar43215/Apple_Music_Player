import PlaylistsPage from "./pages/PlaylistsPage";
import PlaylistDetails from "./pages/PlaylistDetails";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import LibraryPage from "./pages/LibraryPage";
import FavoritesPage from "./pages/FavoritesPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFoundPage from "./pages/NotFoundPage";

import ProtectedRoute from "./components/common/ProtectedRoute";
import GuestRoute from "./components/common/GuestRoute";

import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#17171D",
            color: "#fff",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "18px",
          },
        }}
      />

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

      
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
