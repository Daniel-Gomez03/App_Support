// ============================================
// SERVICIO: SOCKET.IO (socket)
// Singleton de conexión WebSocket al backend.
// forceNew: true evita reutilizar conexiones
// residuales entre hot reloads de Expo.
// Importar este módulo conecta automáticamente.
// ============================================

import { io } from "socket.io-client";

const SOCKET_URL = 'http://192.168.1.24:8000';

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
  forceNew: true,
});

socket.on("connect", () => {
  console.log("Conectado al servidor de Sockets:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Desconectado del servidor de Sockets");
});

export default socket;