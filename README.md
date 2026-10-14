# Fresh Music — Web Application

A modern music streaming web application built with Angular and Tailwind CSS. Fresh Music provides a music discovery and listening experience with dedicated interfaces for users and administrators.

## ✨ Features

- 🎵 Browse and discover published songs
- ▶️ Music playback with a persistent player
- 💿 Explore albums and album details
- ❤️ Like and manage favorite songs
- 📂 Create and manage playlists
- 🕘 View listening history
- 👤 User profile and authentication
- 🛠️ Admin interface for managing songs and albums
- 📱 Responsive interface for different screen sizes

## 🛠️ Tech Stack

- **Framework:** Angular 22
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **API Communication:** HTTP REST APIs
- **Alerts:** SweetAlert2 through a custom alert service
- **Audio Delivery:** Supabase signed URLs through the backend API

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm
- A running Fresh Music backend API

### Installation

```bash
git clone https://github.com/sagarpatil-17/music_web.git
cd music_web
npm install
```

### Configuration

Configure the backend API base URL using the environment configuration supported by your Angular application.

Example:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

### Run the Application

```bash
ng serve
```

### Build for Production

```bash
ng build
```

## 🧭 Application Modules

### User

- Browse songs and albums
- Play available music
- Manage liked songs and playlists
- Review listening history
- Manage profile and authentication

### Admin

- View the admin dashboard
- Upload and manage songs
- Associate songs with albums
- Publish and unpublish songs
- Create, update, and delete albums

## 🔗 Backend Integration

The frontend communicates with the Fresh Music API for authentication, song and album data, playback URLs, playlists, likes, and listening history.

The API URL, authentication handling, and authorization rules must match the backend configuration.

## 🔒 Security

- Protect user and admin routes.
- Enforce authorization on the backend, not just in the frontend.
- Do not expose Supabase service-role keys in browser code.
- Handle API errors and expired playback URLs appropriately.

## 👨‍💻 Author

**Sagar Patil**

- GitHub: [@sagarpatil-17](https://github.com/sagarpatil-17)
- Backend: [music_api](https://github.com/sagarpatil-17/music_api)

---

Built with Angular and Tailwind CSS.
