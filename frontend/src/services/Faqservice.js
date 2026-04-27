import { io } from 'socket.io-client';

const API_URL = 'http://localhost:8000/api';
const SOCKET_BASE_URL = 'http://localhost:8000';

export const socket = io(SOCKET_BASE_URL, {
    autoConnect: false,
    withCredentials: true
});

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
// OBTENER TODAS LAS FAQS ACTIVAS
// ============================================
export const getFaqs = async () => {
    try {
        const response = await fetch(`${API_URL}/faqs`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getFaqs:", error);
        throw error;
    }
};

// ============================================
// OBTENER FAQS INACTIVAS
// ============================================
export const getInactiveFaqs = async () => {
    try {
        const response = await fetch(`${API_URL}/faqs/inactives`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getInactiveFaqs:", error);
        throw error;
    }
};

// ============================================
// OBTENER UNA FAQ POR ID
// ============================================
export const getFaqById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/faqs/${id}`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getFaqById:", error);
        throw error;
    }
};

// ============================================
// CREAR NUEVA FAQ
// ============================================
export const createFaq = async (faqData) => {
    try {
        const response = await fetch(`${API_URL}/faqs`, fetchConfig('POST', faqData));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en createFaq:", error);
        throw error;
    }
};

// ============================================
// ACTUALIZAR FAQ
// ============================================
export const updateFaq = async (id, faqData) => {
    try {
        const response = await fetch(`${API_URL}/faqs/${id}`, fetchConfig('PUT', faqData));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en updateFaq:", error);
        throw error;
    }
};

// ============================================
// CAMBIAR ESTADO DE FAQ (TOGGLE)
// ============================================
export const toggleFaqStatus = async (id) => {
    try {
        const response = await fetch(`${API_URL}/faqs/${id}/toggle`, fetchConfig('PATCH'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en toggleFaqStatus:", error);
        throw error;
    }
};
