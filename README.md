# Real-Time Chat Application

A real-time chat application built with **Node.js**, **React**, **Socket.IO**, and **MongoDB** as part of an intern development task. Users can register, join chat rooms, exchange messages instantly, see who's online, and view chat history.

---

## ✨ Features

- **User Authentication** — Register with username/email/password, login, or sign in via Google/GitHub OAuth
- **Real-Time Messaging** — Send and receive messages instantly using Socket.IO
- **Chat Rooms** — Create, join, and switch between multiple independent chat rooms
- **Online Users** — See currently active users in each room
- **Typing Indicator** — "User is typing…" shown when someone types in a room
- **Chat History** — Messages stored in MongoDB and loaded when joining a room
- **Empty Message Validation** — Prevents sending blank messages

---

## 🧰 Tech Stack

| Layer         | Technology                                   |
|---------------|----------------------------------------------|
| **Backend**   | Node.js, Express 5, TypeScript               |
| **Frontend**  | React 19, Vite, TypeScript                   |
| **Real-time** | Socket.IO 4.8                                |
| **Database**  | MongoDB (Mongoose 9)                         |
| **Auth**      | JWT, Passport.js (Google & GitHub OAuth)      |
| **Styling**   | Vanilla CSS (custom design tokens)           |
| **State**     | Zustand                                      |
| **Validation**| Zod                                          |

---

## 📦 Project Structure

```
chat-application/
├── chat-api/              # Backend — Express + Socket.IO
│   └── src/
│       ├── config/        # DB, Passport strategies
│       ├── controllers/   # Auth, Room, Message handlers
│       ├── middleware/     # JWT verification, error handler
│       ├── models/        # User, Room, Message schemas
│       ├── routes/        # API route definitions
│       ├── socket/        # Socket.IO event handlers
│       ├── types/         # Typed socket events
│       └── utils/         # Validation schemas
│
├── frontend/              # Frontend — React + Vite
│   └── src/
│       ├── components/    # Chat UI, modals, toasts
│       ├── hooks/         # Socket, messages, online users, typing
│       ├── lib/           # API client, socket client, auth storage
│       ├── pages/         # All page components
│       ├── store/         # Zustand auth store
│       └── types/         # Shared interfaces
│
└── docs/
    └── architecture.md    # Detailed architecture documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB** running locally (default: `mongodb://localhost:27017/chat-app`)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd chat-application
```

### 2. Setup & run the backend

```bash
cd chat-api
npm install
```

Create a `.env` file in `chat-api/`:

```env
PORT=8080
CLIENT_URL=http://localhost:5173
MONGO_URL=mongodb://localhost:27017/chat-app
JWT_SECRET_KEY=your_jwt_secret
JWT_REFRESH_SECRET_KEY=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:8080/api/auth/github/callback
NODE_ENV=development
```

Start the server:

```bash
npm run dev
```

### 3. Setup & run the frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
```

Start the dev server:

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## 🔌 Socket Events

### Client → Server

| Event          | Payload                | Description                    |
|----------------|------------------------|--------------------------------|
| `join-room`    | `roomId`               | Join a chat room               |
| `leave-room`   | `roomId`               | Leave a chat room              |
| `send-message` | `{ roomId, content }`  | Send message to a room         |
| `typing`       | `roomId`               | Broadcast typing status        |
| `stop-typing`  | `roomId`               | Broadcast stop typing          |

### Server → Client

| Event              | Payload                                  | Description                  |
|--------------------|------------------------------------------|------------------------------|
| `receive-message`  | `{ _id, content, sender, room, createdAt }` | New message in room       |
| `user-joined`      | `{ roomId, userId, username }`           | User joined a room           |
| `user-left`        | `{ roomId, userId, username }`           | User left a room             |
| `online-users`     | `{ roomId, users[] }`                    | Online users list update     |
| `room-created`     | `{ room }`                               | New room created             |
| `room-deleted`     | `{ id }`                                 | Room was deleted             |
| `user-typing`      | `{ roomId, username }`                   | Someone is typing            |
| `user-stop-typing` | `{ roomId, username }`                   | Someone stopped typing       |

---

## 📡 API Endpoints

Base path: `/api`

### Auth
| Method | Endpoint                | Description              |
|--------|-------------------------|--------------------------|
| POST   | `/auth/register`        | Register new user        |
| POST   | `/auth/login`           | Login with credentials   |
| POST   | `/auth/logout`          | Logout                   |
| GET    | `/auth/me`              | Get current user         |
| GET    | `/auth/google`          | Google OAuth start       |
| GET    | `/auth/google/callback` | Google OAuth callback    |
| GET    | `/auth/github`          | GitHub OAuth start       |
| GET    | `/auth/github/callback` | GitHub OAuth callback    |

### Rooms
| Method | Endpoint      | Description         |
|--------|---------------|---------------------|
| GET    | `/room`       | List all rooms      |
| POST   | `/room`       | Create a room       |
| GET    | `/room/:id`   | Get room details    |
| DELETE | `/room/:id`   | Delete room (owner) |

### Messages
| Method | Endpoint            | Description                |
|--------|---------------------|----------------------------|
| GET    | `/message/:roomId`  | Get chat history for room  |

---

## 📐 Database Models

- **User** — username, email, password (bcrypt), avatar, googleId, githubId, refreshToken
- **Room** — name (unique), description, createdBy (ref: User)
- **Message** — content, sender (ref: User), room (ref: Room), timestamps

---

## 🏗️ Build for Production

### Backend

```bash
cd chat-api
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

---

## 📄 Architecture

For detailed architecture documentation, diagrams, and design decisions, see [docs/architecture.md](docs/architecture.md).
