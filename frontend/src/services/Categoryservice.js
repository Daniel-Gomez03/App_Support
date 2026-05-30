// ============================================
// SERVICIO: CATEGORÍAS
// Consume los endpoints de categorías del panel
// administrativo. Actualmente expone solo la
// consulta de todas las categorías; se puede
// extender con create/update/delete según se
// requiera en el futuro.
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
// FETCH CONFIG
// Construye el objeto de configuración para
// fetch: método, cabeceras JSON y cookies de
// sesión. Serializa el body solo si se provee.
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
// GET CATEGORIES
// Retorna el listado completo de categorías
// registradas en el sistema.
// ============================================
export const getCategories = async () => {
    try {
        const response = await fetch(`${API_URL}/categories`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getCategories:', error);
        throw error;
    }
};
