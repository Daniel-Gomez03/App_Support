import { io } from "socket.io-client";

const SOCKET_URL = 'http://10.10.0.84:8000'; 

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