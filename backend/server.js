const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const fs = require('fs-extra');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const SECRET = 'supersecretkey'; // In production, use env var
const USERS_FILE = './users.json';
const MESSAGES_FILE = './messages.json';

// Load users and messages from file
let users = [];
let messages = [];
fs.readJson(USERS_FILE).then(data => { users = data; }).catch(() => { users = []; });
fs.readJson(MESSAGES_FILE).then(data => { messages = data; }).catch(() => { messages = []; });

// Save messages to file
function saveMessages() {
  fs.writeJson(MESSAGES_FILE, messages).catch(() => {});
}
// Save users to file
function saveUsers() {
  fs.writeJson(USERS_FILE, users).catch(() => {});
}

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (users.find(u => u.username === username)) return res.status(409).json({ error: 'Username already exists' });
  const hash = await bcrypt.hash(password, 10);
  users.push({ username, password: hash });
  saveUsers();
  res.json({ success: true });
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username }, SECRET, { expiresIn: '1d' });
  res.json({ token, username });
});

// Track online users: { socket.id: username }
let onlineUsers = {};
// Map usernames to socket IDs
let userSockets = {};

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const payload = jwt.verify(token, SECRET);
    socket.username = payload.username;
    return next();
  } catch {
    return next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for user login (username sent from client)
  socket.on('login', (username) => {
    onlineUsers[socket.id] = username;
    userSockets[username] = socket.id;
    // Broadcast updated online users list
    io.emit('onlineUsers', Object.values(onlineUsers));
    // Send chat history to the newly connected user
    socket.emit('chatHistory', messages);
  });

  // Listen for new messages
  socket.on('sendMessage', (data) => {
    // Add reactions object to each message
    const msgWithReactions = { ...data, reactions: {} };
    messages.push(msgWithReactions);
    saveMessages();
    io.emit('receiveMessage', msgWithReactions);
  });

  // Handle message reactions
  socket.on('reactToMessage', ({ messageIndex, emoji, username }) => {
    if (messages[messageIndex]) {
      if (!messages[messageIndex].reactions) messages[messageIndex].reactions = {};
      if (!messages[messageIndex].reactions[emoji]) messages[messageIndex].reactions[emoji] = [];
      // Prevent duplicate reactions from same user for same emoji
      if (!messages[messageIndex].reactions[emoji].includes(username)) {
        messages[messageIndex].reactions[emoji].push(username);
      }
      io.emit('updateMessageReactions', { messageIndex, reactions: messages[messageIndex].reactions });
    }
  });

  // Typing indicator
  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });
  socket.on('stopTyping', (username) => {
    socket.broadcast.emit('stopTyping', username);
  });

  // Private messaging
  socket.on('privateMessage', ({ to, from, message, time }) => {
    const toSocketId = userSockets[to];
    const fromSocketId = userSockets[from];
    const privateMsg = { from, to, message, time };
    if (toSocketId) {
      io.to(toSocketId).emit('receivePrivateMessage', privateMsg);
    }
    // Also send to sender for their chat window
    if (fromSocketId && fromSocketId !== toSocketId) {
      io.to(fromSocketId).emit('receivePrivateMessage', privateMsg);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from online users and userSockets
    const username = onlineUsers[socket.id];
    delete onlineUsers[socket.id];
    if (username) delete userSockets[username];
    // Broadcast updated online users list
    io.emit('onlineUsers', Object.values(onlineUsers));
  });
});

app.get('/', (req, res) => {
  res.send('Real-Time Chat Server is running!');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 