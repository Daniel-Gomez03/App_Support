import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';

let socket = null;

export const connectSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        socket.on('connect', () => {
            console.log(' Socket conectado:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log(' Socket desconectado');
        });

        socket.on('connect_error', (error) => {
            console.log('Error de conexión:', error);
        });
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
