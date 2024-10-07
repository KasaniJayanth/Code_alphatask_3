const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const DocumentVersion = require('./models/DocumentVersion');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://localhost:27017/collaborative-editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let users = [];
const documentText = { content: '' };

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.emit('updateText', documentText.content);
  socket.emit('userList', users);

  socket.on('textChange', async (newText) => {
    await DocumentVersion.create({ content: documentText.content });
    documentText.content = newText;
    io.emit('updateText', newText);
  });

  socket.on('cursorUpdate', (position) => {
    const userId = socket.id;
    io.emit('updateCursor', userId, position);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    users = users.filter(user => user.id !== socket.id);
    io.emit('userDisconnected', socket.id);
    io.emit('userList', users);
  });

  users.push({ id: socket.id, name: `User-${socket.id}` });
  io.emit('userList', users);
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});
