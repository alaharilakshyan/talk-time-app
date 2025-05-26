
# ⚡️ 3-Day Fullstack Chat App Development Plan

> 🎯 Goal: Build and deploy a **1-on-1 real-time chat app** with authentication, messaging, audio calls, and a sleek UI — in 3 focused days.

## 🧠 Base Stack (Finalized)

| Layer         | Tech Stack                                          |
| ------------- | --------------------------------------------------- |
| Frontend      | React + Vite + Tailwind CSS + ShadCN UI             |
| State Mgmt    | React state + Context API (Zustand optional)        |
| UI Framework  | ShadCN UI (Radix-based), warm Tailwind color scheme |
| Realtime Comm | Socket.IO                                           |
| Calling       | WebRTC (with Socket.IO signaling)                   |
| Backend       | Node.js + Express + MongoDB (Mongoose)              |
| Auth          | JWT + bcrypt                                        |
| Deployment    | Vercel (frontend), Railway (backend + DB)           |

## 📅 Day 1 — Setup, Auth, and UI Foundation

### ✅ Objectives
- [x] Project scaffolding
- [x] Modern UI with ShadCN
- [x] User registration/login
- [x] Auth-protected routes
- [x] Establish socket connection foundation

### 🧱 Tasks

#### 🔧 Backend (To be implemented)
- [ ] Init Node.js + Express server
- [ ] Setup MongoDB Atlas connection
- [ ] Create `User` model (username, email, passwordHash, avatar)
- [ ] Auth routes: `/register`, `/login` (JWT-based)
- [ ] Add CORS + basic middlewares

#### 🌐 Frontend (In Progress)
- [x] Init Vite project + Tailwind CSS
- [x] Install & setup ShadCN UI
- [x] Create pages: `/login`, `/register`, `/chat`
- [x] Setup routing (React Router)
- [x] Build login/register forms with ShadCN
- [x] Implement JWT-based auth flow (frontend)
- [x] Store token locally, validate on page load
- [x] Implement light/dark mode toggle
- [x] Choose and configure warm Tailwind theme

### 🧪 Day 1 Deliverables
- ✅ Beautiful ShadCN-based UI
- ✅ Working login/registration UI
- ✅ Authenticated user session management
- ✅ Socket.IO client setup (ready for messaging)

## 📅 Day 2 — Messaging System with Real-time Chat

### ✅ Objectives
- Realtime 1-on-1 chat via WebSocket
- Message persistence in DB
- Chat UI (bubbles, scroll, sender highlighting)
- Online user list

### 🧱 Tasks

#### 🔧 Backend
- [ ] Define `Message` schema (senderId, receiverId, text, timestamp)
- [ ] REST endpoint: `/messages/:userId` to fetch history
- [ ] Socket.IO: `user_connected`, `send_message`, `receive_message`
- [ ] Store incoming messages in MongoDB
- [ ] Track online users via memory

#### 🌐 Frontend
- [ ] Build chat dashboard layout (sidebar + chat panel)
- [ ] Implement user list with online indicators
- [ ] Render message bubbles (ShadCN `Card` or custom)
- [ ] Socket events to send/receive messages
- [ ] Scroll to bottom on new message
- [ ] Auto-switch conversation by selecting user

## 📅 Day 3 — Audio Calling, Polish & Deployment

### ✅ Objectives
- Audio call support (via WebRTC)
- UI for call initiation, accept/reject
- Final polish + deploy backend & frontend

### 🧱 Tasks

#### 🔧 Calling System (WebRTC + Socket.IO)
- [ ] Implement signaling with Socket.IO
- [ ] Use `RTCPeerConnection` for audio stream
- [ ] Access user mic (getUserMedia)
- [ ] Handle peer disconnection + cleanup

#### 🌐 Frontend
- [ ] Create call modal (ShadCN `Dialog`)
- [ ] Show incoming call popup
- [ ] Add "Call" button to chat header
- [ ] Integrate WebRTC stream playback

#### 🌍 Deployment
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Connect frontend to backend
- [ ] Add favicon + page titles

## ✅ Current Status

**Day 1 Progress:** ✅ Complete
- Modern UI foundation with ShadCN
- Authentication system (frontend)
- Dark/light mode toggle
- Warm color scheme implementation
- Socket.IO client foundation

**Next Steps:** Implement backend API and move to Day 2 messaging features.
