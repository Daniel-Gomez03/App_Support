const API_BASE_URL = "http://localhost:8000/api";

export const getProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
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
        console.error("Error fetching products:", error);
        throw error;
    }
};