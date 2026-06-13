// ============================================
// SERVICIO: MODELOS DE PRODUCTO
// Centraliza las llamadas a la API REST de
// modelos de producto del panel administrativo.
//
// GET /product-models              → getProductModels
// GET /product/:id/models          → getProductModelsByProduct
// GET /product-models/:id          → getProductModelById
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
// GET PRODUCT MODELS
// Retorna el listado completo de modelos de
// producto registrados en el sistema.
// ============================================
export const getProductModels = async () => {
    try {
        const response = await fetch(`${API_URL}/product-models`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getProductModels:', error);
        throw error;
    }
};

// ============================================
// GET PRODUCT MODELS BY PRODUCT
// Retorna los modelos asociados a un producto
// específico, identificado por su ID.
// ============================================
export const getProductModelsByProduct = async (productId) => {
    try {
        const response = await fetch(`${API_URL}/product/${productId}/models`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getProductModelsByProduct:', error);
        throw error;
    }
};

// ============================================
// GET PRODUCT MODEL BY ID
// Retorna el detalle de un modelo de producto
// por su ID.
// ============================================
export const getProductModelById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/product-models/${id}`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getProductModelById:', error);
        throw error;
    }
};