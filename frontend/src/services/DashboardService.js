const API_URL = 'http://localhost:8000/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = 'Error en la petición al servidor';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
    }
    return await response.json();
};

export const getDashboardStats = async () => {
    const response = await fetch(`${API_URL}/dashboard/stats`, { credentials: 'include' });
    return handleResponse(response);
};