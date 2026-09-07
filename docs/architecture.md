# Architecture — Echo Chat Application

This document explains the high-level architecture, data flow, and technology choices behind Echo.

---

## System Overview

Echo is a full-stack real-time chat application split into two independent services:

```
┌──────────────────────────────────────────────────────┐
│                      Client                          │
│  React 19 + Vite + TypeScript                        │
│  Vanilla CSS  •  Zustand (auth state)                │
│  Socket.IO Client  •  Axios (REST)                   │
└────────────────┬─────────────────┬───────────────────┘
                 │ REST (HTTP)     │ WebSocket
                 ▼                 ▼
┌──────────────────────────────────────────────────────┐
│                      Server                          │
│  Express 5 + TypeScript                              │
│  Socket.IO 4.8 (typed events)                        │
│  Passport.js (Google, GitHub OAuth)                  │
│  JWT (access + refresh tokens)                       │
│  Zod (request validation)                            │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│                    MongoDB                           │
│  Mongoose 9 ODM                                      │
│  Collections: users, rooms, messages                 │
└──────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
chat-application/
├── chat-api/                   # Backend service
│   └── src/
│       ├── config/             # DB connection, Passport strategies
│       ├── controllers/        # Route handlers (auth, room, message)
│       ├── middleware/         # Auth middleware, error handler
│       ├── models/            # Mongoose schemas (User, Room, Message)
│       ├── routes/            # Express route definitions
│       ├── socket/            # Socket.IO setup + event handlers
│       │   └── handlers/      # join/leave room, send message, typing, disconnect
│       ├── types/             # TypeScript type definitions (typed socket events)
│       ├── utils/             # Zod schemas, helpers
│       └── index.ts           # App entry point
│
├── frontend/                  # Frontend service
│   └── src/
│       ├── components/
│       │   ├── chat/          # MessageList, MessageInput, RoomList, OnlineUsers, CreateRoomModal, TypingIndicator
│       │   └── ui/            # ConfirmModal, Toast
│       ├── hooks/             # useSocket, useMessages, useOnlineUsers, useTypingIndicator
│       ├── lib/               # Axios client, Socket.IO client, auth token storage
│       ├── pages/             # LandingPage, LoginPage, RegisterPage, OAuthPage, ChatLayout, RoomsPage, RoomPage
│       ├── store/             # Zustand auth store
│       ├── types/             # Shared TypeScript interfaces
│       ├── App.tsx            # Router config
│       ├── main.tsx           # React entry point
│       └── index.css          # Global styles (vanilla CSS, design tokens)
│
└── docs/
    └── architecture.md        # This file
```

---

## Data Models

### User
| Field         | Type     | Notes                      |
|---------------|----------|----------------------------|
| `username`    | String   | Unique                     |
| `email`       | String   | Unique                     |
| `password`    | String   | Bcrypt hashed (optional for OAuth) |
| `avatar`      | String   | Optional profile picture URL |
| `googleId`    | String   | For Google OAuth           |
| `githubId`    | String   | For GitHub OAuth           |
| `refreshToken`| String   | JWT refresh token          |

### Room
| Field         | Type      | Notes                     |
|---------------|-----------|---------------------------|
| `name`        | String    | Unique room name          |
| `description` | String    | Optional                  |
| `createdBy`   | ObjectId  | Ref → User                |

### Message
| Field     | Type      | Notes                         |
|-----------|-----------|-------------------------------|
| `content` | String    | Message text                  |
| `sender`  | ObjectId  | Ref → User                    |
| `room`    | ObjectId  | Ref → Room, indexed with createdAt |

---

## Authentication Flow

```
1. User registers or logs in via email/password
   → Server validates with Zod
   → Password compared with bcrypt
   → Server returns JWT access token + sets httpOnly refresh cookie

2. User signs in via Google/GitHub OAuth
   → Passport handles OAuth flow
   → Server finds/creates user from profile
   → Redirects to /oauth?accessToken=...
   → Frontend stores token and fetches /auth/me

3. Authenticated requests
   → Frontend attaches token via Axios interceptor
   → Server verifies JWT in auth middleware
   → Socket connections also verified via socketAuth middleware
```

---

## Real-Time Communication (Socket.IO)

All real-time features use typed Socket.IO events for type safety.

### Client → Server Events
| Event          | Payload                        | Description                      |
|----------------|--------------------------------|----------------------------------|
| `join-room`    | `roomId: string`               | Join a chat room                 |
| `leave-room`   | `roomId: string`               | Leave a chat room                |
| `send-message` | `{ roomId, content }`          | Send a message to a room         |
| `typing`       | `roomId: string`               | Notify room that user is typing  |
| `stop-typing`  | `roomId: string`               | Notify room that user stopped    |

### Server → Client Events
| Event              | Payload                                    | Description                          |
|--------------------|--------------------------------------------|--------------------------------------|
| `receive-message`  | `{ _id, content, sender, room, createdAt }`| New message broadcast                |
| `user-joined`      | `{ roomId, userId, username }`             | User joined notification             |
| `user-left`        | `{ roomId, userId, username }`             | User left notification               |
| `online-users`     | `{ roomId, users[] }`                      | Current online users list            |
| `room-created`     | `{ room }`                                 | New room broadcast                   |
| `room-deleted`     | `{ id }`                                   | Room deletion broadcast              |
| `user-typing`      | `{ roomId, username }`                     | Typing indicator broadcast           |
| `user-stop-typing` | `{ roomId, username }`                     | Stop typing broadcast                |

---

## REST API Endpoints

| Method | Endpoint                   | Auth | Description                   |
|--------|----------------------------|------|-------------------------------|
| POST   | `/api/auth/register`       | No   | Register new user             |
| POST   | `/api/auth/login`          | No   | Login with email/password     |
| POST   | `/api/auth/logout`         | No   | Clear auth cookies            |
| GET    | `/api/auth/me`             | Yes  | Get current user profile      |
| GET    | `/api/auth/google`         | No   | Start Google OAuth            |
| GET    | `/api/auth/google/callback`| No   | Google OAuth callback         |
| GET    | `/api/auth/github`         | No   | Start GitHub OAuth            |
| GET    | `/api/auth/github/callback`| No   | GitHub OAuth callback         |
| GET    | `/api/room`                | Yes  | List all rooms                |
| POST   | `/api/room`                | Yes  | Create a room                 |
| GET    | `/api/room/:id`            | Yes  | Get room details              |
| DELETE | `/api/room/:id`            | Yes  | Delete room (owner only)      |
| GET    | `/api/message/:roomId`     | Yes  | Get chat history for a room   |
| GET    | `/api/healthcheck`         | No   | Server health status          |

---

## Key Design Decisions

1. **Vite over CRA** — Faster dev server and HMR, smaller bundle output
2. **Vanilla CSS** — No Tailwind dependency, full control over styles, custom design tokens
3. **Typed Socket.IO events** — Both server and client share typed event definitions preventing runtime mismatches
4. **Zustand** — Minimal auth state management (single store, no Redux boilerplate)
5. **JWT in Authorization header** — Access tokens sent via header, refresh tokens in httpOnly cookies
6. **Room-scoped messages** — Messages indexed by `(room, createdAt)` for efficient history loading
7. **Debounced typing** — Client debounces typing events (2s timeout) to avoid spamming the server
