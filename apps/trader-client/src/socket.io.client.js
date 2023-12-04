"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_client_1 = require("socket.io-client");
// import { EnvConfig } from 'apps/trade-server/src/config/env.config';
var serverUrl = "http://localhost:8080"; // Replace with your server URL
var socket = (0, socket_io_client_1.io)(serverUrl);
// Connect event
socket.on('connect', function () {
    console.log('Connected to the server');
    // Emit a test message
    socket.emit('testMessage', 'Hello, Server!');
    // Listen for server responses
    socket.on('testMessageResponse', function (data) {
        console.log('Server response:', data);
    });
    // Listen for server responses
    socket.on('onDasTraderEmit', function (data) {
        console.log('Das Trader Server emit:', JSON.stringify(data));
    });
});
// Disconnect event
socket.on('disconnect', function () {
    console.log('Disconnected from the server');
});
