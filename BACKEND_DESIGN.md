
# Backend Design & API Specifications

## 🏗️ Architecture Overview

### Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.IO
- **CORS**: Enabled for frontend communication
- **Environment**: Railway deployment

### Project Structure
```
backend/
├── src/
│   ├── models/
│   │   ├── User.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── messages.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── cors.js
│   ├── socket/
│   │   └── socketHandlers.js
│   ├── config/
│   │   └── database.js
│   └── server.js
├── package.json
└── .env
```

## 📊 Database Schemas

### User Schema
```javascript
{
  _id: ObjectId,
  username: String (required, unique, min: 3, max: 20),
  email: String (required, unique, valid email),
  passwordHash: String (required, bcrypt hashed),
  avatar: String (optional, URL or base64),
  isOnline: Boolean (default: false),
  lastSeen: Date (default: Date.now),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### Message Schema
```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: 'User', required),
  receiverId: ObjectId (ref: 'User', required),
  text: String (required, max: 1000),
  timestamp: Date (default: Date.now),
  isRead: Boolean (default: false),
  messageType: String (enum: ['text', 'system'], default: 'text')
}
```

## 🔌 REST API Endpoints

### Authentication Routes
```
POST /api/auth/register
Body: { username, email, password }
Response: { user: {...}, token: "jwt_token" }

POST /api/auth/login
Body: { email, password }
Response: { user: {...}, token: "jwt_token" }

GET /api/auth/me
Headers: { Authorization: "Bearer jwt_token" }
Response: { user: {...} }

POST /api/auth/logout
Headers: { Authorization: "Bearer jwt_token" }
Response: { message: "Logged out successfully" }
```

### User Routes
```
GET /api/users
Headers: { Authorization: "Bearer jwt_token" }
Response: { users: [...] } // All users except current user

GET /api/users/online
Headers: { Authorization: "Bearer jwt_token" }
Response: { users: [...] } // Online users only
```

### Message Routes
```
GET /api/messages/:userId
Headers: { Authorization: "Bearer jwt_token" }
Query: { page?: number, limit?: number }
Response: { messages: [...], hasMore: boolean }

POST /api/messages
Headers: { Authorization: "Bearer jwt_token" }
Body: { receiverId, text }
Response: { message: {...} }
```

## 🔄 Socket.IO Events

### Client → Server Events
```javascript
// User connects
'user_connected' → { userId }

// Send message
'send_message' → { receiverId, text }

// User disconnects (automatic)
'disconnect' → handled automatically
```

### Server → Client Events
```javascript
// User comes online
'user_online' → { userId, username }

// User goes offline
'user_offline' → { userId }

// Receive new message
'receive_message' → { message: {...} }

// Message delivery confirmation
'message_sent' → { messageId, timestamp }
```

## 🔐 Authentication Flow

### JWT Token Structure
```javascript
{
  userId: ObjectId,
  email: String,
  username: String,
  iat: Number, // issued at
  exp: Number  // expires in 7 days
}
```

### Frontend Token Management
- Store JWT in `localStorage` with key: `chat-token`
- Store user data in `localStorage` with key: `chat-user`
- Include token in all API requests: `Authorization: Bearer ${token}`
- Auto-logout on token expiration

## 🌐 CORS Configuration
```javascript
{
  origin: [
    'http://localhost:5173', // Vite dev server
    'https://your-app.lovable.app', // Lovable staging
    'https://your-custom-domain.com' // Production domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

## ⚙️ Environment Variables
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_secure_jwt_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## 🚀 Deployment Specifications

### Railway Configuration
```javascript
// railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  }
}
```

## 📱 Frontend Integration Points

### API Service (src/services/api.js)
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auth methods
export const authAPI = {
  login: (email, password) => post('/auth/login', { email, password }),
  register: (username, email, password) => post('/auth/register', { username, email, password }),
  getMe: () => get('/auth/me'),
  logout: () => post('/auth/logout')
};

// User methods
export const userAPI = {
  getUsers: () => get('/users'),
  getOnlineUsers: () => get('/users/online')
};

// Message methods
export const messageAPI = {
  getMessages: (userId, page = 1) => get(`/messages/${userId}?page=${page}`),
  sendMessage: (receiverId, text) => post('/messages', { receiverId, text })
};
```

### Socket Service (src/services/socket.js)
```javascript
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const socketService = {
  socket: null,
  
  connect: (token) => {
    this.socket = io(SOCKET_URL, {
      auth: { token }
    });
  },
  
  disconnect: () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },
  
  // Event listeners
  on: (event, callback) => this.socket?.on(event, callback),
  off: (event, callback) => this.socket?.off(event, callback),
  
  // Event emitters
  emitUserConnected: (userId) => this.socket?.emit('user_connected', { userId }),
  emitSendMessage: (receiverId, text) => this.socket?.emit('send_message', { receiverId, text })
};
```

## 🔍 Error Handling

### Standard Error Responses
```javascript
{
  success: false,
  error: {
    message: "User-friendly error message",
    code: "ERROR_CODE",
    details: {...} // Optional additional details
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid input data
- `UNAUTHORIZED`: Missing or invalid token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `DUPLICATE_ENTRY`: Email/username already exists
- `SERVER_ERROR`: Internal server error

## 📋 Implementation Checklist

### Phase 1: Basic Setup
- [x] Initialize Node.js project
- [x] Install dependencies (express, mongoose, socket.io, etc.)
- [x] Setup MongoDB connection
- [x] Create basic Express server
- [x] Configure CORS

### Phase 2: Authentication
- [x] Create User model
- [x] Implement registration endpoint
- [x] Implement login endpoint
- [x] Create JWT middleware
- [x] Add auth validation

### Phase 3: Real-time Messaging
- [ ] Create Message model
- [ ] Implement message endpoints
- [ ] Setup Socket.IO server
- [ ] Handle user connections
- [ ] Implement message broadcasting

### Phase 4: Testing & Deployment
- [ ] Test all endpoints
- [ ] Test socket connections
- [ ] Deploy to Railway
- [ ] Configure environment variables
- [ ] Test production deployment

## 🔗 Frontend Environment Variables
```
VITE_API_URL=https://your-backend.railway.app
```
