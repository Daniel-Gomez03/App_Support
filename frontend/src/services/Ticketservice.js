import { io } from 'socket.io-client';

const API_URL = 'http://localhost:8000/api';
const SOCKET_BASE_URL = 'http://localhost:8000';

export const socket = io(SOCKET_BASE_URL, {
    autoConnect: false,
    withCredentials: true
});

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = 'Error en la petición al servidor';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
        }
        throw new Error(errorMessage);
    }
    return await response.json();
};

const fetchConfig = (method, body = null) => {
    const config = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    };
    if (body) config.body = JSON.stringify(body);
    return config;
};

const fetchFormDataConfig = (method, formData) => {
    return {
        method: method,
        body: formData,
        credentials: 'include'
    };
};

// ============================================
// OBTENER TODOS LOS TICKETS 
// ============================================
export const getAllTickets = async () => {
    try {
        const response = await fetch(`${API_URL}/tickets`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getAllTickets:", error);
        return [];
    }
};

// ============================================
// OBTENER TICKET POR ID
// ============================================
export const getTicketById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getTicketById:", error);
        throw error;
    }
};

// ============================================
// CREAR TICKET 
// ============================================
export const createTicketAdmin = async (formData) => {
    try {
        const response = await fetch(`${API_URL}/tickets`, fetchFormDataConfig('POST', formData));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en createTicketAdmin:", error);
        throw error;
    }
};

// ============================================
// ACTUALIZAR TICKET
// ============================================
export const updateTicket = async (id, data) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}`, fetchConfig('PUT', data));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en updateTicket:", error);
        throw error;
    }
};

// ============================================
// CAMBIAR ESTADO 
// ============================================
export const toggleTicketStatus = async (id) => {
    try {
        const response = await fetch(`${API_URL}/tickets/toggle/${id}`, fetchConfig('PATCH'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en toggleTicketStatus:", error);
        throw error;
    }
};

// ============================================
// ELIMINAR TICKET
// ============================================
export const deleteTicket = async (id) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}`, fetchConfig('DELETE'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en deleteTicket:", error);
        throw error;
    }
};