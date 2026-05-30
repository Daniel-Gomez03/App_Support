const API_URL = 'http://localhost:8000/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = 'Error en la petición al servidor';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
    }
    return await response.json();
};

export const getAllSalidas = async () => {
    const response = await fetch(`${API_URL}/salidas`, { credentials: 'include' });
    return handleResponse(response);
};

export const getTicketsByUser = async (userId) => {
    const response = await fetch(`${API_URL}/salidas/tickets/${userId}`, { credentials: 'include' });
    return handleResponse(response);
};

export const createSalida = async (data) => {
    const response = await fetch(`${API_URL}/salidas`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const updateSalidaStatus = async (id, data) => {
    const response = await fetch(`${API_URL}/salidas/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};