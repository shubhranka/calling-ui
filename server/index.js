// File: /server/index.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:3002' } }); // Adjust for your frontend port

let rooms = [];
let users = [{ id: '1', username: 'Sensei', email: 'sensei@example.com', password: 'pass123' }];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', ({ username, email, password }, callback) => {
    if (users.some((u) => u.email === email)) return callback({ success: false, error: 'Email exists' });
    const user = { id: socket.id, username, email, password };
    users.push(user);
    callback({ success: true, user });
  });

  socket.on('login', ({ email, password }, callback) => {
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) return callback({ success: false, error: 'Invalid credentials' });
    // Update the user's id to the current socket id.
    callback({ success: true, user: { ...user, id: socket.id } });
  });

  socket.on('createRoom', ({ title, isPublic }, callback) => {
    console.log('Received createRoom:', { title, isPublic });
    // Generate a unique room ID instead of relying solely on Date.now()
    const roomId = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const room = {
      id: roomId,
      title,
      hostId: socket.id,
      participants: [{ userId: socket.id, isSpeaker: true, isMuted: false }],
      isPublic,
    };
    rooms.push(room);
    socket.join(roomId);
    io.emit('roomsUpdated', rooms);
    console.log('Sending createRoom callback:', roomId);
    callback(roomId);
  });

  socket.on('joinRoom', (roomId, callback) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room || room.participants.some((p) => p.userId === socket.id)) {
      io.to(roomId).emit('roomUpdated', room);
      io.emit('roomsUpdated', rooms);
      callback(true);
      return;
    }
    room.participants.push({ userId: socket.id, isSpeaker: false, isMuted: false });
    socket.join(roomId);
    io.to(roomId).emit('roomUpdated', room);
    io.emit('roomsUpdated', rooms);
    callback(true);
  });

  socket.on('leaveRoom', (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      room.participants = room.participants.filter((p) => p.userId !== socket.id);
      socket.leave(roomId);
      io.to(roomId).emit('roomUpdated', room);
      io.emit('roomsUpdated', rooms);
    }
  });

  socket.on('toggleMute', ({ roomId, userId }) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      room.participants = room.participants.map((p) =>
        p.userId === userId ? { ...p, isMuted: !p.isMuted } : p
      );
      io.to(roomId).emit('roomUpdated', room);
    }
  });

  socket.on('promoteToSpeaker', ({ roomId, userId }) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room && room.hostId === socket.id) {
      room.participants = room.participants.map((p) =>
        p.userId === userId ? { ...p, isSpeaker: true, isMuted: false } : p
      );
      io.to(roomId).emit('roomUpdated', room);
    }
  });

  socket.on('kickUser', ({ roomId, userId }) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room && room.hostId === socket.id) {
      room.participants = room.participants.filter((p) => p.userId !== userId);
      io.to(roomId).emit('roomUpdated', room);
      io.emit('roomsUpdated', rooms);
    }
  });

  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', { offer, from: socket.id });
  });

  socket.on('answer', ({ roomId, answer, to }) => {
    socket.to(to).emit('answer', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { candidate, from: socket.id });
  });

  socket.on('disconnect', () => {
    rooms = rooms.map((r) => ({
      ...r,
      participants: r.participants.filter((p) => p.userId !== socket.id),
    }));
    io.emit('roomsUpdated', rooms);
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3001, () => console.log('Server running on port 3001'));