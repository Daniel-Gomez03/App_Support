const API_BASE_URL = "http://localhost:8000/api";

export const getCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Error fetching categories');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

export const getProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('Error fetching products');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

export const getProductModels = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/product-models`);
        if (!response.ok) throw new Error('Error fetching product models');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};