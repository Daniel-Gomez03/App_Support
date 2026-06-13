// ============================================
// SERVICIO: TICKETS
// Centraliza las llamadas a la API REST del
// módulo de tickets y reexporta el socket de
// Userservice para uso en componentes de chat.
//
// GET    /tickets/unassigned          → getUnassignedTicketCount
// GET    /tickets/active/count        → getActiveTicketCount
// GET    /tickets/active/list         → getActiveTicketsList
// GET    /tickets/:id/comments        → getTicketComments
// POST   /tickets/:id/comments        → addTicketComment
// DELETE /tickets/:id/comments/:cId   → deleteTicketComment
// PUT    /tickets/:id/assign          → assignTicket
// GET    /tickets                     → getAllTickets
// GET    /tickets/:id                 → getTicketById
// POST   /tickets                     → createTicketAdmin
// PUT    /tickets/:id                 → updateTicket
// PATCH  /tickets/:id/status          → updateTicketStatus
// PATCH  /tickets/toggle/:id          → toggleTicketStatus
// DELETE /tickets/:id                 → deleteTicket
// GET    /historial                   → getHistorialTickets
// PATCH  /tickets/:id/pause           → toggleChatPause
// PUT    /historial/:id               → updateHistorialTicket
// ============================================

import { socket } from './Userservice';

export { socket };

const API_URL = 'http://localhost:8000/api';

// ============================================
// HANDLE RESPONSE
// Extrae el JSON de la respuesta o lanza un
// Error con el mensaje devuelto por el servidor.
// ============================================
const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = 'Error en la petición al servidor';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) { }
        throw new Error(errorMessage);
    }
    return response.json();
};

// ============================================
// FETCH CONFIG
// Construye la configuración fetch para
// peticiones con body JSON y cookies de sesión.
// ============================================
const fetchConfig = (method, body = null) => {
    const config = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    };
    if (body) config.body = JSON.stringify(body);
    return config;
};

// ============================================
// FETCH FORM DATA CONFIG
// Configuración fetch para peticiones multipart
// (FormData). No establece Content-Type para
// que el navegador lo asigne con el boundary.
// ============================================
const fetchFormDataConfig = (method, formData) => ({
    method,
    body: formData,
    credentials: 'include',
});

// ============================================
// GET UNASSIGNED TICKET COUNT
// Retorna el conteo de tickets pendientes de
// asignación a un agente.
// ============================================
export const getUnassignedTicketCount = async () => {
    try {
        const response = await fetch(`${API_URL}/tickets/unassigned`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getUnassignedTicketCount:', error);
        return { count: 0 };
    }
};

// ============================================
// GET ACTIVE TICKET COUNT
// Retorna el conteo de tickets actualmente
// en curso (no resueltos ni cancelados).
// ============================================
export const getActiveTicketCount = async () => {
    try {
        const response = await fetch(`${API_URL}/tickets/active/count`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getActiveTicketCount:', error);
        return { count: 0 };
    }
};

// ============================================
// GET ACTIVE TICKETS LIST
// Retorna el listado de tickets activos para
// mostrar en el tablero Kanban.
// ============================================
export const getActiveTicketsList = async () => {
    try {
        const response = await fetch(`${API_URL}/tickets/active/list`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getActiveTicketsList:', error);
        return [];
    }
};

// ============================================
// GET TICKET COMMENTS
// Retorna los comentarios de un ticket.
// ============================================
export const getTicketComments = async (ticketId) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getTicketComments:', error);
        return [];
    }
};

// ============================================
// ADD TICKET COMMENT
// Agrega un comentario a un ticket usando
// FormData (soporta archivos adjuntos).
// ============================================
export const addTicketComment = async (ticketId, formData) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en addTicketComment:', error);
        throw error;
    }
};

// ============================================
// DELETE TICKET COMMENT
// Elimina un comentario específico de un ticket.
// ============================================
export const deleteTicketComment = async (ticketId, commentId) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${ticketId}/comments/${commentId}`, fetchConfig('DELETE'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en deleteTicketComment:', error);
        throw error;
    }
};

// ============================================
// ASSIGN TICKET
// Asigna un ticket a uno o más agentes de
// soporte.
// ============================================
export const assignTicket = async (id, assignmentData) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}/assign`, fetchConfig('PUT', assignmentData));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en assignTicket:', error);
        throw error;
    }
};

// ============================================
// GET ALL TICKETS
// Retorna el listado completo de tickets
// registrados en el sistema.
// ============================================
export const getAllTickets = async () => {
    try {
        const response = await fetch(`${API_URL}/tickets`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getAllTickets:', error);
        return [];
    }
};

// ============================================
// GET TICKET BY ID
// Retorna el detalle de un ticket por su ID.
// ============================================
export const getTicketById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getTicketById:', error);
        throw error;
    }
};

// ============================================
// CREATE TICKET ADMIN
// Crea un nuevo ticket desde el panel admin
// usando FormData (soporta archivos adjuntos).
// ============================================
export const createTicketAdmin = async (formData) => {
    try {
        const response = await fetch(`${API_URL}/tickets`, fetchFormDataConfig('POST', formData));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en createTicketAdmin:', error);
        throw error;
    }
};

// ============================================
// UPDATE TICKET
// Actualiza los datos generales de un ticket.
// ============================================
export const updateTicket = async (id, data) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}`, fetchConfig('PUT', data));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en updateTicket:', error);
        throw error;
    }
};

// ============================================
// UPDATE TICKET STATUS
// Avanza o retrocede el estado de un ticket
// dentro del flujo de atención.
// ============================================
export const updateTicketStatus = async (id, statusId) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}/status`, fetchConfig('PATCH', { ticket_status_id: statusId }));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en updateTicketStatus:', error);
        throw error;
    }
};

// ============================================
// TOGGLE TICKET STATUS
// Alterna el estado activo/inactivo de un
// ticket (borrado lógico).
// ============================================
export const toggleTicketStatus = async (id) => {
    try {
        const response = await fetch(`${API_URL}/tickets/toggle/${id}`, fetchConfig('PATCH'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en toggleTicketStatus:', error);
        throw error;
    }
};

// ============================================
// DELETE TICKET
// Elimina un ticket permanentemente por su ID.
// ============================================
export const deleteTicket = async (id) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}`, fetchConfig('DELETE'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en deleteTicket:', error);
        throw error;
    }
};

// ============================================
// GET HISTORIAL TICKETS
// Retorna todos los tickets del historial
// (resueltos y cerrados).
// ============================================
export const getHistorialTickets = async () => {
    try {
        const response = await fetch(`${API_URL}/historial`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getHistorialTickets:', error);
        return [];
    }
};

// ============================================
// TOGGLE CHAT PAUSE
// Pausa o reanuda el chat de un ticket para
// controlar la interacción con el cliente.
// ============================================
export const toggleChatPause = async (id) => {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}/pause`, fetchConfig('PATCH'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en toggleChatPause:', error);
        throw error;
    }
};

// ============================================
// UPDATE HISTORIAL TICKET
// Actualiza los datos de un ticket en el
// historial por su ID.
// ============================================
export const updateHistorialTicket = async (id, data) => {
    try {
        const response = await fetch(`${API_URL}/historial/${id}`, fetchConfig('PUT', data));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en updateHistorialTicket:', error);
        throw error;
    }
};
