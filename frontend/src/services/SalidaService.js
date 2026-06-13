// ============================================
// SERVICIO: SALIDAS
// Centraliza las llamadas a la API REST del
// módulo de salidas del panel administrativo.
//
// GET   /salidas                      → getAllSalidas
// GET   /salidas/tickets/:userId      → getTicketsByUser
// POST  /salidas                      → createSalida
// PATCH /salidas/:id/status           → updateSalidaStatus
// ============================================

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
// GET ALL SALIDAS
// Retorna el historial completo de salidas
// registradas en el sistema.
// ============================================
export const getAllSalidas = async () => {
    const response = await fetch(`${API_URL}/salidas`, { credentials: 'include' });
    return handleResponse(response);
};

// ============================================
// GET TICKETS BY USER
// Retorna los tickets resueltos asociados a un
// agente/usuario, usados para registrar salidas.
// ============================================
export const getTicketsByUser = async (userId) => {
    const response = await fetch(`${API_URL}/salidas/tickets/${userId}`, { credentials: 'include' });
    return handleResponse(response);
};

// ============================================
// CREATE SALIDA
// Registra una nueva salida a partir de un
// ticket resuelto por un agente.
// ============================================
export const createSalida = async (data) => {
    const response = await fetch(`${API_URL}/salidas`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

// ============================================
// UPDATE SALIDA STATUS
// Actualiza el estado de una salida existente
// por su ID.
// ============================================
export const updateSalidaStatus = async (id, data) => {
    const response = await fetch(`${API_URL}/salidas/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};