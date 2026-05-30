// ============================================
// SERVICIO: DASHBOARD
// Consume el endpoint de estadísticas generales
// del panel administrativo.
//
// GET /dashboard/stats → getDashboardStats
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
// GET DASHBOARD STATS
// Retorna los contadores y métricas generales
// mostrados en la página principal del panel.
// ============================================
export const getDashboardStats = async () => {
    const response = await fetch(`${API_URL}/dashboard/stats`, { credentials: 'include' });
    return handleResponse(response);
};