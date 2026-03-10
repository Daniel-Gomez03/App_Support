const API_BASE_URL = "http://localhost:8000/api";

export const getCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
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
        console.error("Error fetching categories:", error);
        throw error;
    }
};

export const getCategoryById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
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
        console.error("Error fetching category:", error);
        throw error;
    }
};

export const createCategory = async (categoryData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
};

export const updateCategory = async (id, categoryData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
};

export const deleteCategory = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
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
        console.error("Error deleting category:", error);
        throw error;
    }
};

export const toggleCategoryStatus = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}/toggle`, {
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
        console.error("Error toggling category status:", error);
        throw error;
    }
};