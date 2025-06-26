# Architecture & Flow: Real-Time Chat Application

## Overview
This application is a full-stack real-time chat app using Node.js (Express) for the backend and React for the frontend, with Socket.IO enabling real-time communication. It supports authentication, persistent storage, and a modern UI.

## Backend
- **Express.js** serves as the HTTP server and REST API for authentication.
- **Socket.IO** manages WebSocket connections for real-time messaging.
- **File-based storage** holds users (users.json) and chat history (messages.json).
- **bcrypt** hashes user passwords.
- **jsonwebtoken (JWT)** is used for secure authentication and session management.
- On client connection, the server authenticates the user via JWT, then sends chat history.
- When a message is sent, the server saves it and broadcasts to all connected clients.
- Private messages are delivered only to the intended recipient and sender.

## Frontend
- **React** provides the user interface.
- **socket.io-client** connects to the backend for real-time updates, using JWT for authentication.
- Users can register, log in, and their session is managed with JWT in localStorage.
- Modern, responsive UI with theme toggle, avatars, and browser notifications.
- Users can send public or private messages, react to messages, and see typing/online status.

## Data Flow
1. **User registers/logs in:**
   - Sends credentials to backend via REST API.
   - Receives JWT on success, stored in localStorage.
2. **Socket connection:**
   - Client connects to backend via Socket.IO, sending JWT for authentication.
   - On success, receives chat history and online users list.
3. **Messaging:**
   - User sends a message (public or private).
   - Message is saved to file and broadcasted (or sent privately).
   - All clients update their chat history in real-time.
4. **Notifications:**
   - If the browser tab is inactive, a notification is shown for new messages.

## Scalability
- The backend is structured to support multiple users and can be extended to use a database (e.g., MongoDB) for production scalability.
- Socket.IO efficiently manages multiple concurrent connections.
- File-based storage is suitable for demo/small scale; swap for DB for large scale.

## Security
- Passwords are hashed with bcrypt.
- JWT is used for secure authentication and session management.
- Socket.IO connections are authenticated with JWT.

## Diagram
```
[User1]         [User2]
   |                |
   |  (Socket.IO)   |
   +------> [Node.js/Express/Socket.IO] <------+
   |                |
   |<-- messages -->|
```

## Extensibility
- Swap file-based storage for a database for production.
- Add group chats, message editing/deleting, or more notification types.
- Add profile pictures, password reset, or admin features. 