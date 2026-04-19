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

// ============================================
// OBTENER TODOS LOS PRODUCTOS
// ============================================
export const getProducts = async () => {
    try {
        const response = await fetch(`${API_URL}/products`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getProducts:", error);
        throw error;
    }
};

