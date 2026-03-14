const API_BASE_URL = "http://localhost:8000/api";

export const getProductModels = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/product-models`, {
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
        const response = await fetch(`${API_BASE_URL}/products/${productId}/models`, {  // ✅ CORRECTO
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