// ============================================
// SERVICIO: PRODUCTOS
// Centraliza las llamadas a la API REST de
// productos del panel administrativo.
//
// GET /products → getProducts
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
// GET PRODUCTS
// Retorna el listado completo de productos
// registrados en el sistema.
// ============================================
export const getProducts = async () => {
    try {
        const response = await fetch(`${API_URL}/products`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getProducts:', error);
        throw error;
    }
};
