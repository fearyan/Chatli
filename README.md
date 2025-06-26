# Real-Time Chat Application

A full-stack real-time chat application built with Node.js, Express, Socket.IO, and React.

## Features
- User login (simple username, no authentication)
- Real-time messaging
- Chat history
- Responsive design (mobile & desktop)

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- npm

### Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   node server.js
   ```
   The backend will run on `http://localhost:5000` by default.

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000` by default.

## Usage
- Open [http://localhost:3000](http://localhost:3000) in your browser.
- Enter a username to join the chat.
- Start sending and receiving messages in real-time!

## Project Structure
```
LIA/
  backend/      # Node.js + Express + Socket.IO server
  frontend/     # React client app
```

## Optional Features
- Typing indicators
- User online status

## License
This project is for educational/demo purposes. 