// ============================================
// SERVICIO: FILTROS
// Provee los datos de referencia usados en los
// filtros del panel administrativo: categorías,
// productos y modelos. Cada función retorna []
// en caso de error para no interrumpir la UI.
//
// GET /categories      → getCategories
// GET /products        → getProducts
// GET /product-models  → getProductModels
// ============================================

const API_BASE_URL = 'http://localhost:8000/api';

// ============================================
// GET CATEGORIES
// Retorna todas las categorías disponibles para
// usar como opciones de filtro.
// ============================================
export const getCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Error fetching categories');
        return response.json();
    } catch (error) {
        console.error('Error en getCategories:', error);
        return [];
    }
};

// ============================================
// GET PRODUCTS
// Retorna todos los productos disponibles para
// usar como opciones de filtro.
// ============================================
export const getProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('Error fetching products');
        return response.json();
    } catch (error) {
        console.error('Error en getProducts:', error);
        return [];
    }
};

// ============================================
// GET PRODUCT MODELS
// Retorna todos los modelos de producto para
// usar como opciones de filtro.
// ============================================
export const getProductModels = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/product-models`);
        if (!response.ok) throw new Error('Error fetching product models');
        return response.json();
    } catch (error) {
        console.error('Error en getProductModels:', error);
        return [];
    }
};