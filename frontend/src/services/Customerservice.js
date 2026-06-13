// ============================================
// SERVICIO: CLIENTES
// Centraliza las llamadas a la API REST de
// clientes y expone la instancia de Socket.IO
// para escuchar eventos en tiempo real desde
// el panel administrativo.
//
// GET    /customers                        → getCustomers
// GET    /customers/:id                    → getCustomerById
// POST   /customers/register-admin         → registerAdminCustomer
// PUT    /customers/:id                    → updateCustomer
// PATCH  /customers/:id/toggle-status      → toggleCustomerStatus
// POST   /customers/:id/verify-email       → sendVerificationEmailAdmin
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
// FETCH FORM DATA CONFIG
// Configuración fetch para peticiones multipart
// (FormData). No establece Content-Type para
// que el navegador lo asigne con el boundary.
// ============================================
const fetchFormDataConfig = (method, formData) => ({
    method,
    body: formData,
    credentials: 'include',
});

// ============================================
// GET CUSTOMERS
// Retorna el arreglo de clientes. Normaliza la
// respuesta tanto si llega como arreglo directo
// como si viene envuelta en { customers: [] }.
// ============================================
export const getCustomers = async () => {
    try {
        const response = await fetch(`${API_URL}/customers`, fetchConfig('GET'));
        const data = await handleResponse(response);
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.customers)) return data.customers;
        return [];
    } catch (error) {
        console.error('Error en getCustomers:', error);
        return [];
    }
};

// ============================================
// GET CUSTOMER BY ID
// Retorna el detalle de un cliente por su ID.
// ============================================
export const getCustomerById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/customers/${id}`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getCustomerById:', error);
        throw error;
    }
};

// ============================================
// REGISTER ADMIN CUSTOMER
// Crea un cliente desde el panel administrativo
// usando FormData (soporta imagen de perfil).
// ============================================
export const registerAdminCustomer = async (formData) => {
    try {
        const response = await fetch(`${API_URL}/customers/register-admin`, fetchFormDataConfig('POST', formData));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en registerAdminCustomer:', error);
        throw error;
    }
};

// ============================================
// UPDATE CUSTOMER
// Actualiza los datos de un cliente por su ID
// usando FormData (soporta imagen de perfil).
// ============================================
export const updateCustomer = async (id, formData) => {
    try {
        const response = await fetch(`${API_URL}/customers/${id}`, fetchFormDataConfig('PUT', formData));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en updateCustomer:', error);
        throw error;
    }
};

// ============================================
// TOGGLE CUSTOMER STATUS
// Alterna el estado activo/inactivo de un
// cliente. El servidor determina el nuevo estado.
// ============================================
export const toggleCustomerStatus = async (id) => {
    try {
        const response = await fetch(`${API_URL}/customers/${id}/toggle-status`, fetchConfig('PATCH'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en toggleCustomerStatus:', error);
        throw error;
    }
};

// ============================================
// SEND VERIFICATION EMAIL ADMIN
// Envía o reenvía el correo de verificación de
// cuenta a un cliente desde el panel admin.
// ============================================
export const sendVerificationEmailAdmin = async (id) => {
    try {
        const response = await fetch(`${API_URL}/customers/${id}/verify-email`, fetchConfig('POST'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en sendVerificationEmailAdmin:', error);
        throw error;
    }
};