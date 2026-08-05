# 🎵 MERN Music Player

A production-ready, Spotify-inspired music streaming app built with the MERN stack.

## Project Structure

```
mern-music-player/
├── server/     # Express + MongoDB REST API
└── client/     # React 19 + Vite + Tailwind frontend
```

## Milestone Progress

- [x] **Milestone 1** — Project setup, folder structure, DB connection, base server/client boot
- [x] **Milestone 2** — Authentication (signup, login, JWT, protected routes)
- [x] **Milestone 3** — Song upload & management (Multer, CRUD, search/filter)
- [x] **Milestone 4** — Custom music player (play/pause/seek/queue/shuffle/repeat)
- [ ] Milestone 5 — Playlists & Favorites
- [ ] Milestone 6 — Dashboard & UI polish (skeletons, toasts, empty states)
- [ ] Milestone 7 — Deployment (Vercel + Render + Atlas)

## Prerequisites

- Node.js 18+
- A MongoDB connection string (local MongoDB or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

## Backend Setup

```bash
cd server
npm install
cp .env.example .env
# edit .env and set MONGO_URI, JWT_SECRET, etc.
npm run dev
```

The API will start on `http://localhost:5000`. Verify it's working:

```bash
curl http://localhost:5000/api/health
```

## Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# edit .env if your API runs on a different URL
npm run dev
```

The app will start on `http://localhost:5173`.

## Environment Variables

### `server/.env`
| Variable | Description |
|---|---|
| `PORT` | Port the API runs on (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs — use a long random string |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `CLIENT_URL` | Frontend origin(s) allowed by CORS, comma-separated |
| `MAX_AUDIO_SIZE_MB` / `MAX_IMAGE_SIZE_MB` | Upload size limits |

### `client/.env`
| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

## Tech Stack

**Frontend:** React 19, Vite, React Router, Tailwind CSS, Axios, React Icons, Framer Motion, Context API
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Multer

## License

Private project — not licensed for redistribution.
