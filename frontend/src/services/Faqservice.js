const API_BASE_URL = "http://localhost:8000/api";

// Obtener todas las FAQs activas
export const getFaqs = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/faqs`, {
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
        console.error("Error fetching FAQs:", error);
        throw error;
    }
};

// Obtener FAQs inactivas
export const getInactiveFaqs = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/faqs/inactives`, {
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
        console.error("Error fetching inactive FAQs:", error);
        throw error;
    }
};

// Obtener una FAQ específica
export const getFaqById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/faqs/${id}`, {
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
        console.error("Error fetching FAQ:", error);
        throw error;
    }
};

// Crear nueva FAQ
export const createFaq = async (faqData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/faqs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(faqData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating FAQ:", error);
        throw error;
    }
};

// Actualizar FAQ
export const updateFaq = async (id, faqData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/faqs/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(faqData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating FAQ:", error);
        throw error;
    }
};

// Cambiar estado de FAQ
export const toggleFaqStatus = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/faqs/${id}/toggle`, {
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
        console.error("Error toggling FAQ status:", error);
        throw error;
    }
};