import { io } from 'socket.io-client';
const API_URL = 'http://localhost:8000/api';
const SOCKET_BASE_URL = 'http://localhost:8000';

export const socket = io(SOCKET_BASE_URL, {
    autoConnect: false, 
    withCredentials: true
});

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error en la petición al servidor');
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
// VERIFICAR SESIÓN Y OBTENER USUARIO ACTUAL
// ============================================
export const getCurrentUser = async () => {
    try {
        const response = await fetch(`${API_URL}/me`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getCurrentUser:", error);
        throw error;
    }
};

// ============================================
// OBTENER TODOS LOS USUARIOS
// ============================================
export const getUsers = async () => {
    try {
        const response = await fetch(`${API_URL}/users`, fetchConfig('GET'));
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data.users || []);
    } catch (error) {
        console.error("Error en getUsers:", error);
        throw error;
    }
};

// ============================================
// OBTENER Modulos 
// ============================================
export const getSecciones = async () => {
    try {
        const response = await fetch(`${API_URL}/secciones`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getSecciones:", error);
        throw error;
    }
};

// ============================================
// ACTUALIZAR USUARIO 
// ============================================
export const updateUser = async (id, userData) => {
    try {
        const response = await fetch(`${API_URL}/users/${id}`, fetchConfig('PUT', {
            rol: userData.rol,
            cargo: userData.cargo,
            area: userData.area,
            permisos: userData.permisos
        }));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en updateUser:", error);
        throw error;
    }
};

// ============================================
// CAMBIAR ESTADO
// ============================================
export const toggleUserStatus = async (id) => {
    try {
        const response = await fetch(`${API_URL}/users/${id}/toggle-status`, fetchConfig('PATCH'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en toggleUserStatus:", error);
        throw error;
    }
};