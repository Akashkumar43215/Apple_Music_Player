# 🎵 MERN Music Player

# 🎵 MERN Music Player

A modern, full-stack Spotify-inspired music streaming application built with the **MERN Stack**. Users can upload songs, stream music, create playlists, mark favorites, and enjoy a beautiful responsive UI with secure authentication and cloud-based media storage.

![License](https://img.shields.io/badge/License-MIT-green)
![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-success)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)
![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-orange)

---

## 🚀 Live Demo

### 🌐 Frontend
https://apple-music-player-one.vercel.app

### ⚙️ Backend API
https://apple-music-player.onrender.com

---

# 📸 Screenshots

> Add screenshots here after uploading them to GitHub.

| Home Page | Music Player |
|-----------|--------------|
| ![Home](screenshots/home.png) | ![Player](screenshots/player.png) |

| Upload Song | Playlist |
|-------------|----------|
| ![Upload](screenshots/upload.png) | ![Playlist](screenshots/playlist.png) |

---

# ✨ Features

## 👤 Authentication

- Secure JWT Authentication
- User Registration & Login
- Protected Routes
- Persistent Login

---

## 🎵 Music Features

- Upload Songs
- Upload Album Artwork
- Cloudinary Media Storage
- Stream Music
- Play / Pause
- Next / Previous
- Shuffle
- Repeat
- Seek Bar
- Song Duration

---

## ❤️ Library

- Favorite Songs
- Recently Played
- Playlist Management
- Playlist CRUD Operations

---

## 🔍 Search & Filter

- Search Songs
- Search Artist
- Search Album
- Genre Filter
- Pagination

---

## 🎨 User Interface

- Modern Glassmorphism Design
- Responsive Layout
- Smooth Animations
- Mobile Friendly
- Dark Theme
- Interactive Music Player

---

# 🛠 Tech Stack

## Frontend

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- React Icons
- React Hot Toast

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Cloudinary
- Music Metadata
- Express Async Handler

---

## Database

- MongoDB Atlas

---

## Cloud Storage

- Cloudinary

---

# 📁 Project Structure

```text
mern-music-player/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/Apple_Music_Player.git
```

```bash
cd Apple_Music_Player
```

---

## Install Frontend

```bash
cd client
npm install
```

---

## Install Backend

```bash
cd ../server
npm install
```

---

# 🔐 Environment Variables

## Backend (.env)

```env
PORT=5000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

---

## Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

# ▶️ Run Project

## Backend

```bash
cd server
npm run dev
```

---

## Frontend

```bash
cd client
npm run dev
```

---

# 🌐 Deployment

### Frontend

- Vercel

### Backend

- Render

### Database

- MongoDB Atlas

### Media Storage

- Cloudinary

---

# 📌 API Endpoints

## Authentication

```http
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
```

---

## Songs

```http
GET     /api/songs
GET     /api/songs/:id
POST    /api/songs
PUT     /api/songs/:id
DELETE  /api/songs/:id
```

---

## Playlists

```http
GET     /api/playlists
POST    /api/playlists
PUT     /api/playlists/:id
DELETE  /api/playlists/:id
```

---

## Favorites

```http
GET    /api/favorites
POST   /api/favorites/:songId
DELETE /api/favorites/:songId
```

---

# 📈 Future Improvements

- Lyrics Support
- Audio Visualizer
- Queue Management
- User Profiles
- Social Sharing
- Listening History Analytics
- AI Music Recommendation
- Download Songs
- Offline Mode

---

# 👨‍💻 Author

**Akash Kumar**

- GitHub: https://github.com/Akashkumar43215
- LinkedIn: *(Add your LinkedIn profile here)*

---

# ⭐ Support

If you found this project helpful, please consider giving it a ⭐ on GitHub.

It helps others discover the project and motivates future improvements.

---

# 📄 License

This project is licensed under the MIT License.

## License

Private project — not licensed for redistribution.
