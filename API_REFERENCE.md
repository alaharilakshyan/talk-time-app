
# API Reference Guide

## Quick Start

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-backend.railway.app/api
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f7e1b8c9d4e2f1a3b5c6d7",
      "username": "johndoe",
      "email": "john@example.com",
      "avatar": null,
      "isOnline": true,
      "createdAt": "2023-09-05T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f7e1b8c9d4e2f1a3b5c6d7",
      "username": "johndoe",
      "email": "john@example.com",
      "avatar": null,
      "isOnline": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer your_jwt_token
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f7e1b8c9d4e2f1a3b5c6d7",
      "username": "johndoe",
      "email": "john@example.com",
      "avatar": null,
      "isOnline": true
    }
  }
}
```

## User Endpoints

### Get All Users
```http
GET /api/users
Authorization: Bearer your_jwt_token
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "64f7e1b8c9d4e2f1a3b5c6d8",
        "username": "janedoe",
        "email": "jane@example.com",
        "avatar": null,
        "isOnline": false,
        "lastSeen": "2023-09-05T09:15:00.000Z"
      }
    ]
  }
}
```

### Get Online Users
```http
GET /api/users/online
Authorization: Bearer your_jwt_token
```

## Message Endpoints

### Get Messages with User
```http
GET /api/messages/64f7e1b8c9d4e2f1a3b5c6d8?page=1&limit=50
Authorization: Bearer your_jwt_token
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "64f7e1b8c9d4e2f1a3b5c6d9",
        "senderId": "64f7e1b8c9d4e2f1a3b5c6d7",
        "receiverId": "64f7e1b8c9d4e2f1a3b5c6d8",
        "text": "Hello there!",
        "timestamp": "2023-09-05T10:45:00.000Z",
        "isRead": false
      }
    ],
    "hasMore": false,
    "currentPage": 1,
    "totalPages": 1
  }
}
```

### Send Message
```http
POST /api/messages
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "receiverId": "64f7e1b8c9d4e2f1a3b5c6d8",
  "text": "Hello! How are you doing?"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "64f7e1b8c9d4e2f1a3b5c6da",
      "senderId": "64f7e1b8c9d4e2f1a3b5c6d7",
      "receiverId": "64f7e1b8c9d4e2f1a3b5c6d8",
      "text": "Hello! How are you doing?",
      "timestamp": "2023-09-05T11:00:00.000Z",
      "isRead": false
    }
  }
}
```

## Socket.IO Events

### Client Events (Emit to Server)

#### Connect User
```javascript
socket.emit('user_connected', {
  userId: '64f7e1b8c9d4e2f1a3b5c6d7'
});
```

#### Send Message
```javascript
socket.emit('send_message', {
  receiverId: '64f7e1b8c9d4e2f1a3b5c6d8',
  text: 'Hello from socket!'
});
```

### Server Events (Listen from Server)

#### User Online
```javascript
socket.on('user_online', (data) => {
  console.log(`${data.username} is now online`);
  // Update UI to show user as online
});
```

#### User Offline
```javascript
socket.on('user_offline', (data) => {
  console.log(`User ${data.userId} went offline`);
  // Update UI to show user as offline
});
```

#### Receive Message
```javascript
socket.on('receive_message', (data) => {
  console.log('New message:', data.message);
  // Add message to chat UI
});
```

#### Message Sent Confirmation
```javascript
socket.on('message_sent', (data) => {
  console.log('Message delivered:', data.messageId);
  // Update UI to show message as sent
});
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 6 characters"
    }
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "code": "UNAUTHORIZED"
  }
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "code": "NOT_FOUND"
  }
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": {
    "message": "Internal server error",
    "code": "SERVER_ERROR"
  }
}
```

## Rate Limiting

### Limits
- Authentication endpoints: 5 requests per minute per IP
- Message sending: 30 messages per minute per user
- General API: 100 requests per minute per user

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1693910400
```
