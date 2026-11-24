# Design

How the Apple-style music player is put together and why. Describes the code as it is today.

## 1. Goals and constraints

- A music streaming app for a small library (about 130 songs), run entirely on free tiers: Vercel (client), Render (server), MongoDB Atlas, Cloudinary (audio and covers).
- Stack is fixed: React 19 + Vite + Tailwind 3 on the client, Express + Mongoose on the server. No paid services.
- Changes stay small and backward compatible. Old clients must keep working against a newer server.
- Data is never changed without a dry-run, a preview and a backup that can be restored.

## 2. Architecture

```
Browser (Vercel)                         Render (free)                  Services
React SPA + service worker  --HTTPS-->  Express API  --Mongoose-->     MongoDB Atlas
  PlayerContext (2 <audio>)              JWT + refresh tokens           Cloudinary (audio, covers)
  IndexedDB (offline songs)              helmet, rate limits            LRCLIB (lyrics, via server)
  <audio> streams from Cloudinary directly
```

- The client plays audio straight from Cloudinary URLs. The API never streams audio.
- The free Render server sleeps when idle. The client detects an unreachable server, shows "Waking up the server…" and retries (`ServerStatus`, `api.js`).
- Lyrics come from LRCLIB through the server (no key needed). The server caches results for 24 hours in memory.

## 3. Data model (MongoDB)

| Model | Key fields | Notes |
|---|---|---|
| Song | title, artist, album, genre, mood, duration, audioUrl, coverUrl, uploadedBy, playCount | `album` defaults to "Single". `genre` and `mood` are both enums. Text index on title/artist/album. |
| User | name, email, password (hashed), avatar, role | role is `user` or `admin`. |
| RefreshToken | user, hashed token, expiry | Only the hash is stored. |
| Favorite, Playlist, PlaylistSong | per user | |
| RecentlyPlayed, PlayEvent | per user | PlayEvent holds listened seconds for stats and Daily Mix. |

### Mood and genre

The original `genre` field held moods (Romantic, Chill…) mixed with real genres (Rap, Bollywood…). They are now two fields:

- `mood`: how a song feels. Enum `MOODS` in `server/config/constants.js`, mirrored in `client/src/utils/constants.js`.
- `genre`: kept as it was, so old clients work. `GENRES` still lists the old mood values.
- `server/utils/mood.js` bridges the two: `moodOf(song)` is its own mood, else the mood an old-style genre implies. `genreOf(song)` is a real genre only, so a mood is never matched twice.
- Old clients send only `genre`. On upload and edit the server copies a mood-like genre into `mood`.
- Migration is `server/scripts/migrateMood.js` (dry-run by default, `--apply`, `--restore`). 125 songs got a mood. 4 Dance songs have none on purpose.
- No song has a real genre tag yet. That was deliberately left for the owner.

## 4. API

All under `/api`. Public means no login needed.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/signup`, `/login`, `/refresh`, `/logout`. `GET/PUT /auth/me`. `PUT /auth/change-password`. |
| Songs | `GET /songs` (search, artist, album, genre, mood, sort, page). `GET /songs/:id`, `/:id/similar` (public). `GET /songs/:id/lyrics` (login). `GET /songs/meta/filters`, `/meta/browse`, `/meta/suggest`. `POST /songs` (admin). `PUT` and `DELETE /songs/:id` (uploader only). |
| Library | `/favorites`, `/playlists`, `/recently-played` |
| Discovery | `GET /smart` (Daily Mix, top artists, most played, recently added, mood mixes). `GET /stats`, `POST /stats/listen`. |

Conventions:
- Validation with express-validator. Bad input gives 400.
- Errors go through one handler. In production a 5xx shows only "Something went wrong".
- List endpoints break ties on `_id`, so pages never repeat or skip songs.
- User search text is regex-escaped.

## 5. Security

- **Tokens:** short access JWT (15 min) plus a hashed refresh token. Changing the password revokes all refresh tokens. The client replays a 401 once after one shared refresh call.
- **Roles:** only admins upload songs. Edit and delete need to be the uploader. Changing an email needs the current password.
- **Hardening:** helmet, compression, rate limits (API 1000 per 15 min, failed logins 10 per 15 min, signups 20 per hour), avatar must be an http(s) URL, `trust proxy` set for Render.
- **Known limits:** the refresh token does not rotate and lives in localStorage.

## 6. Client structure

```
src/
  pages/        Library, Browse (artists/albums), Recently Played, Stats, Login, Signup, Playlist…
  layouts/      MainLayout (skip link, #main-content), TopBar, Sidebar
  components/   common, library, player, playlist, song, ui
  context/      AuthContext, PlayerContext
  hooks/        usePlayer, useAuth, useEscape, useFocusTrap, useOfflineSong …
  services/     api.js (axios + refresh), authService, songService
  utils/        crossfade, audioDecks, offlineSongs, lrc, constants, format
  __tests__/    vitest + Testing Library
```

- Routes are lazy-loaded (`React.lazy`). `ProtectedRoute` shows the offline screen when a signed-in user opens the app without a network.
- Media Session (lock-screen controls) and keyboard shortcuts both use the player context's `togglePlay`.

## 7. Player design

`PlayerContext` owns playback. It uses two `<audio>` elements ("decks"), created in `utils/audioDecks.js`.

- **Gapless:** after 5 s of a song, the next song loads on the idle deck. When the song ends, playback switches to that deck.
- **Crossfade:** 0, 3, 6, 9 or 12 s, saved in `localStorage` (`crossfadeSec`). An equal-power volume ramp runs every 50 ms. `finishFade` ends any fade on pause, seek, next, previous, jump, new song or sleep timer.
- **iOS Safari fallback:** `canControlVolume` is false there, so a single element is used with no preload and no crossfade. The crossfade menu is hidden.
- **Preload on mobile data:** "Preload only on Wi-Fi" skips preloading when the browser reports `cellular` or data-saver. Only Chrome on Android reports this. Elsewhere it is unknown and counts as Wi-Fi.
- **Sleep timer, repeat (off, all, one), shuffle and queue** live in the same context. Events from the inactive deck are ignored (`live()` check).

## 8. Offline design

1. **App shell** (`public/sw.js`): same-origin only. Hashed `/assets/*` are cache-first. Pages and icons are network-first, so a new deploy shows up at once, and the cache is used only when offline. API, audio and images are never cached by the worker. It registers in production only.
2. **Offline screen:** if the app opens with no network while signed in, the token is kept and the screen shows "You're offline". It continues by itself on the `online` event. A server that rejects the token still goes to login.
3. **Saved songs:** the download button in the expanded player stores the audio blob and its metadata in IndexedDB. The player uses the local copy when one exists. The offline screen lists saved songs and plays them. Covers are not stored.
4. **Limits:** about 6 MB per song, and the browser may evict storage under pressure (`storage.persist()` is requested). The offline list shows only when the app is opened offline, not when the connection drops mid-session.

## 9. UI design language

- **Look:** dark, Apple-Music-inspired. Background `#0a0a0f` with violet (`#8b5cf6`) and cyan (`#06b6d4`) accents. Glass surfaces (`.glass`, `.glass-card`) with blur and soft shadows.
- **Type:** Inter, falling back to the system font.
- **Motion:** Framer Motion for entrances and sheets. `MotionConfig reducedMotion="user"` respects the OS setting.
- **Layout:** Sidebar plus TopBar on desktop. On mobile the TopBar search collapses behind a toggle. The mini player sits at the bottom and opens a full-screen Now Playing sheet (cover, controls, queue, volume, crossfade, offline, sleep timer, lyrics, similar songs).
- **Home (Library):** hero, continue listening, "Browse by Mood" cards, smart playlists, then the filterable song list with separate Mood and Genre selects.
- **Admin-only UI:** the Upload button and upload/edit modal.

### Accessibility

- Skip link and a `main` landmark.
- Modals have `role="dialog"`, `aria-modal`, Escape to close, and a focus trap that returns focus to the opener (`useFocusTrap`).
- Menus use `menuitemradio` and `menuitemcheckbox`. Icon buttons have labels. The offline screen uses `role="alert"`.

### PWA and SEO

Web app manifest with 192 px, 512 px and Apple touch icons, theme colour, and meta and Open Graph tags in `index.html`.

## 10. Testing

| Where | Tool | Command |
|---|---|---|
| `client/src/**` | vitest, jsdom, Testing Library | `npm test` |
| `server/scripts/*.test.js` | node:test | `npm test` |

- Client has 51 tests: player, gapless, crossfade, menus, focus trap, offline, mood/genre.
- Server has 13 tests: title cleaning, lyrics matching, mood helpers, Daily Mix.
- Backend end-to-end was run once against a throwaway user: 59 of 59 checks passed (auth, filters, favorites, playlists, stats, upload/edit/delete). The script was not kept, because it writes to the real database.
- **Never verified by a machine:** how gapless and crossfade sound, mobile layout, and the browser console. These need a person.

## 11. Operations

- **Deploy order:** server changes go to Render first, then Vercel. Set `NODE_ENV=production` on Render.
- **Git:** `main` on GitHub, with Vercel and Render deploying from it.
- **Data scripts** (`server/scripts/`):
  - `cleanMetadata.js`: titles, artists and albums. Dry-run, `--apply`, `--restore`, `--from-file`.
  - `migrateMood.js`: the mood migration.
  - Each `--apply` writes a backup file first. Undo with `--restore <file>`.
- **Cloudflare** sits in front of Render and blocks automated clients (curl gets "Just a moment…"). Check the live API in a browser.

## 12. Known gaps

- 12 songs still show a label (T-Series, Sony Music…) as the artist. Real singers were not known.
- No real genre tags yet. Only moods are set.
- Refresh token does not rotate and sits in localStorage.
- Offline: covers are not saved, and the song list shows only when the app starts offline.
- Several artist and album names were added from memory, not verified online.
