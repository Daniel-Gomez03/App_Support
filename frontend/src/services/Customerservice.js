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

const fetchFormDataConfig = (method, formData) => {
    return {
        method: method,
        body: formData, 
        credentials: 'include'
    };
};

// ============================================
// OBTENER TODOS LOS CLIENTES 
// ============================================
export const getCustomers = async () => {
    try {
        const response = await fetch(`${API_URL}/customers`, fetchConfig('GET'));
        const data = await handleResponse(response);
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.customers)) return data.customers;
        return [];
    } catch (error) {
        console.error("Error en getCustomers:", error);
        return [];
    }
};

// ============================================
// OBTENER CLIENTE POR ID
// ============================================
export const getCustomerById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/customers/${id}`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getCustomerById:", error);
        throw error;
    }
};

// ============================================
// REGISTRAR CLIENTE (Desde Panel Admin)
// ============================================
export const registerAdminCustomer = async (formData) => {
    try {
        const response = await fetch(`${API_URL}/customers/register-admin`, fetchFormDataConfig('POST', formData));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en registerAdminCustomer:", error);
        throw error;
    }
};

// ============================================
// ACTUALIZAR CLIENTE
// ============================================
export const updateCustomer = async (id, formData) => {
    try {
        const response = await fetch(`${API_URL}/customers/${id}`, fetchFormDataConfig('PUT', formData));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en updateCustomer:", error);
        throw error;
    }
};

// ============================================
// CAMBIAR ESTADO DEL CLIENTE
// ============================================
export const toggleCustomerStatus = async (id) => {
    try {
        const response = await fetch(`${API_URL}/customers/${id}/toggle-status`, fetchConfig('PATCH'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en toggleCustomerStatus:", error);
        throw error;
    }
};

// ============================================
// ENVIAR/REENVIAR VERIFICACIÓN DE EMAIL
// ============================================
export const sendVerificationEmailAdmin = async (id) => {
    try {
        const response = await fetch(`${API_URL}/customers/${id}/verify-email`, fetchConfig('POST'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en sendVerificationEmailAdmin:", error);
        throw error;
    }
};