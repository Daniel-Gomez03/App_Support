const API_BASE_URL = "http://localhost:8000/api";

export const getProductModels = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/models/bulk-upload`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching product models:", error);
        throw error;
    }
};

export const getProductModelsByProduct = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/models`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching product models by product:", error);
        throw error;
    }
};

export const getProductModelById = async (productId, modelId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/models/${modelId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching product model:", error);
        throw error;
    }
};

export const createProductModel = async (productId, modelData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/models`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(modelData),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating product model:", error);
        throw error;
    }
};

export const updateProductModel = async (productId, modelId, modelData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/models/${modelId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(modelData),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating product model:", error);
        throw error;
    }
};

export const deleteProductModel = async (productId, modelId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/models/${modelId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting product model:", error);
        throw error;
    }
};

export const toggleProductModelStatus = async (productId, modelId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/models/${modelId}/toggle`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error toggling product model status:", error);
        throw error;
    }
};