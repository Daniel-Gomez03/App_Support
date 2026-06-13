// ============================================
// SERVICIO: SOCKET.IO
// Gestiona el ciclo de vida de la conexión
// WebSocket compartida del panel administrativo.
// Mantiene una única instancia de socket para
// evitar conexiones duplicadas entre componentes.
//
// connectSocket    → abre la conexión si no existe
// disconnectSocket → cierra la conexión y limpia
// ============================================

import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';

let socket = null;

// ============================================
// CONNECT SOCKET
// Inicializa la conexión WebSocket solo si no
// existe una instancia activa. Retorna el socket
// para que el llamador pueda suscribirse a
// eventos específicos del módulo.
// ============================================
export const connectSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        socket.on('connect', () => {
            console.log('Socket conectado:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Socket desconectado');
        });

        socket.on('connect_error', (error) => {
            console.error('Error de conexión Socket:', error);
        });
    }

    return socket;
};

// ============================================
// DISCONNECT SOCKET
// Cierra la conexión WebSocket activa y limpia
// la referencia para permitir reconexión futura.
// ============================================
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
