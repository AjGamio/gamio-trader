import * as net from 'net';

export const socketServer = () => {
  const socketServer = net.createServer((socket) => {
    // Handle socket connections here
    console.log('Socket connected:', socket.remoteAddress, socket.remotePort);

    // You can handle socket events, such as 'data', 'end', etc.
    socket.on('data', (data) => {
      console.log('Received data from socket:', data.toString());
      // Process the data or respond to the socket as needed
    });

    socket.on('end', () => {
      console.log('Socket disconnected');
    });

    // You can send data to the socket as well
    socket.write('Hello from socket server!\r\n');
  });
  return socketServer;
};
