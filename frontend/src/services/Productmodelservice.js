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
// OBTENER TODOS LOS MODELOS DE PRODUCTOS
// ============================================
export const getProductModels = async () => {
    try {
        const response = await fetch(`${API_URL}/product-models`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getProductModels:", error);
        throw error;
    }
};

// ============================================
// OBTENER MODELOS POR PRODUCTO ESPECÍFICO
// ============================================
export const getProductModelsByProduct = async (productId) => {
    try {
        const response = await fetch(`${API_URL}/product/${productId}/models`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getProductModelsByProduct:", error);
        throw error;
    }
};

// ============================================
// OBTENER MODELO POR ID
// ============================================
export const getProductModelById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/product-models/${id}`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getProductModelById:", error);
        throw error;
    }
};