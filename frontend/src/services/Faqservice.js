// ============================================
// SERVICIO: PREGUNTAS FRECUENTES (FAQs)
// Centraliza las llamadas a la API REST de FAQs
// y expone la instancia de Socket.IO para
// escuchar eventos en tiempo real desde el
// panel administrativo.
//
// GET   /faqs              → getFaqs
// GET   /faqs/inactives    → getInactiveFaqs
// GET   /faqs/:id          → getFaqById
// POST  /faqs              → createFaq
// PUT   /faqs/:id          → updateFaq
// PATCH /faqs/:id/toggle   → toggleFaqStatus
// ============================================

import { io } from 'socket.io-client';

const API_URL = 'http://localhost:8000/api';
const SOCKET_BASE_URL = 'http://localhost:8000';

// Instancia compartida de Socket.IO. autoConnect:false
// permite controlar manualmente cuándo conectar.
export const socket = io(SOCKET_BASE_URL, {
    autoConnect: false,
    withCredentials: true,
});

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
// GET FAQS
// Retorna todas las FAQs activas del sistema.
// ============================================
export const getFaqs = async () => {
    try {
        const response = await fetch(`${API_URL}/faqs`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getFaqs:', error);
        throw error;
    }
};

// ============================================
// GET INACTIVE FAQS
// Retorna las FAQs desactivadas del sistema.
// ============================================
export const getInactiveFaqs = async () => {
    try {
        const response = await fetch(`${API_URL}/faqs/inactives`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getInactiveFaqs:', error);
        throw error;
    }
};

// ============================================
// GET FAQ BY ID
// Retorna el detalle de una FAQ por su ID.
// ============================================
export const getFaqById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/faqs/${id}`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getFaqById:', error);
        throw error;
    }
};

// ============================================
// CREATE FAQ
// Crea una nueva FAQ con la pregunta y respuesta
// proporcionadas.
// ============================================
export const createFaq = async (faqData) => {
    try {
        const response = await fetch(`${API_URL}/faqs`, fetchConfig('POST', faqData));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en createFaq:', error);
        throw error;
    }
};

// ============================================
// UPDATE FAQ
// Actualiza la pregunta o respuesta de una FAQ
// existente por su ID.
// ============================================
export const updateFaq = async (id, faqData) => {
    try {
        const response = await fetch(`${API_URL}/faqs/${id}`, fetchConfig('PUT', faqData));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en updateFaq:', error);
        throw error;
    }
};

// ============================================
// TOGGLE FAQ STATUS
// Alterna el estado activo/inactivo de una FAQ.
// El servidor determina el nuevo estado.
// ============================================
export const toggleFaqStatus = async (id) => {
    try {
        const response = await fetch(`${API_URL}/faqs/${id}/toggle`, fetchConfig('PATCH'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en toggleFaqStatus:', error);
        throw error;
    }
};
