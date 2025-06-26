const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

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

// In-memory message store
let messages = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send chat history to the newly connected user
  socket.emit('chatHistory', messages);

  // Listen for new messages
  socket.on('sendMessage', (data) => {
    messages.push(data);
    io.emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Real-Time Chat Server is running!');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 