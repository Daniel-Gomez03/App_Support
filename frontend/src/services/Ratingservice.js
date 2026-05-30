// ============================================
// SERVICIO: CALIFICACIONES
// Consume el endpoint de calificaciones de
// tickets del panel administrativo.
//
// GET /ratings → getAllRatings
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
// GET ALL RATINGS
// Retorna todas las calificaciones registradas
// por los clientes sobre sus tickets resueltos.
// ============================================
export const getAllRatings = async () => {
    const response = await fetch(`${API_URL}/ratings`, { credentials: 'include' });
    return handleResponse(response);
};
