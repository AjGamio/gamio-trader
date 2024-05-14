import { io, Socket } from 'socket.io-client';
// import { EnvConfig } from 'apps/trade-server/src/config/env.config';

const serverUrl = `https://trading.gamio-services.net`; // Replace with your server URL

const socket: Socket = io(serverUrl);

// Connect event
socket.on('connect', () => {
  console.log('Connected to the server');

  // Emit a test message
  socket.emit('testMessage', 'Hello, Server!');

  // Listen for server responses
  socket.on('testMessageResponse', (data: string) => {
    console.log('Server response:', data);
  });

  // Listen for server responses
  socket.on('onDasTraderEmit', (data: any) => {
    console.log('Das Trader Server emit:', JSON.stringify(data));
  });
});

// Disconnect event
socket.on('disconnect', () => {
  console.log('Disconnected from the server');
});
