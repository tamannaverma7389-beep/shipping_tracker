const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const { connectMongoDb } = require('./connection');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

connectMongoDb();
console.log("Mongo URL:", process.env.MONGO_URL);

// Mock tracking function
const trackPackage = async (trackingNumber) => {
  return {
    status: 'In Transit',
    location: 'Jabalpur, MP',
    eta: 'Feb 3, 2026',
    details: `Package ${trackingNumber} is moving.`
  };
};

io.on('connection', (socket) => {
  console.log('✅ User connected');

  let activePoll = null;

  socket.on('message', async (msg) => {
    const match = msg.match(/1Z[A-Z0-9]{16}/i);

    if (msg.toLowerCase().includes('help')) {
      socket.emit(
        'bot-reply',
        'Commands:\n• track <number>\n• help\n• history'
      );
      return;
    }

    if (msg.toLowerCase().includes('track') && !match) {
      socket.emit(
        'bot-reply',
        'Please send a valid tracking number like: track 1Z12345E0205277936'
      );
      return;
    }

    if (match) {
      const trackingNumber = match[0];
      socket.emit(
        'bot-reply',
        `Confirm tracking ${trackingNumber}? Click YES or NO`
      );

      socket.once('confirm', async (answer) => {
        if (answer === 'YES') {
          const status = await trackPackage(trackingNumber);
          socket.emit('bot-reply', 'Tracking started 🚚');
          socket.emit('status-update', status);

          // Live polling every 30s
          let lastStatus = null;

activePoll = setInterval(async () => {
  const updated = await trackPackage(trackingNumber);

  if (updated.status !== lastStatus) {
    socket.emit('status-update', updated);

    if (updated.status === 'Out for Delivery') {
      socket.emit('bot-reply', '🚚 Your package is OUT FOR DELIVERY today!');
    }

    if (updated.status === 'Delivered') {
      socket.emit('bot-reply', '🎉 Package delivered successfully!');
      clearInterval(activePoll);
    }

    lastStatus = updated.status;
  }
}, 30000);

        } else {
          socket.emit('bot-reply', 'Tracking cancelled.');
        }
      });
      return;
    }

    socket.emit('bot-reply', 'Say "track <number>" or type "help"');
  });

  socket.on('history', () => {
    socket.emit('bot-reply', '📜 History feature coming soon (MongoDB ready)');
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
    if (activePoll) clearInterval(activePoll);
  });
});

server.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
