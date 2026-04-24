import { socket } from './Userservice';

export { socket };

const API_URL = 'http://localhost:8000/api';

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
// OBTENER CONTEO DE TICKETS NO ASIGNADOS
// ============================================
export const getUnassignedTicketCount = async () => {
    try {
        const response = await fetch(`${API_URL}/tickets/unassigned`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getUnassignedTicketCount:", error);
        return { count: 0 };
    }
};

// ============================================
// OBTENER CONTEO DE TICKETS ACTIVO
// ============================================
export const getActiveTicketCount = async () => {
    try {
        const response = await fetch(`${API_URL}/tickets/active/count`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getActiveTicketCount:", error);
        return { count: 0 };
    }
};

// ============================================
// OBTENER LISTA DE TICKETS ACTIVOS
// ============================================
export const getActiveTicketsList = async () => {
    try {
        const response = await fetch(`${API_URL}/tickets/active/list`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getActiveTicketsList:", error);
        return [];
    }
};

// ============================================
// COMENTARIOS DE UN TICKET
// ============================================
export const getTicketComments = async (ticketId) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getTicketComments:", error);
        return [];
    }
};

export const addTicketComment = async (ticketId, formData) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en addTicketComment:", error);
        throw error;
    }
};

export const deleteTicketComment = async (ticketId, commentId) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${ticketId}/comments/${commentId}`, fetchConfig('DELETE'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en deleteTicketComment:", error);
        throw error;
    }
};

// ============================================
// ASIGNAR TICKET A TÉCNICO(S)
// ============================================
export const assignTicket = async (id, assignmentData) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}/assign`, fetchConfig('PUT', assignmentData));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en assignTicket:", error);
        throw error;
    }
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
// ACTUALIZAR TICKET (GENERAL)
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
// ACTUALIZAR SOLO ESTADO (Avanzar/Cancelar)
// ============================================
export const updateTicketStatus = async (id, statusId) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}/status`, fetchConfig('PATCH', { ticket_status_id: statusId }));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en updateTicketStatus:", error);
        throw error;
    }
};

// ============================================
// CAMBIAR ESTADO (Borrado Lógico Activo/Inactivo)
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