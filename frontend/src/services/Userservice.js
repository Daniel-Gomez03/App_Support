// ============================================
// SERVICIO: USUARIOS
// Centraliza las llamadas a la API REST del
// módulo de usuarios y expone la instancia de
// Socket.IO compartida con Ticketservice.
//
// GET   /me                        → getCurrentUser
// GET   /users                     → getUsers
// GET   /secciones                 → getSecciones
// PUT   /users/:id                 → updateUser
// PATCH /users/:id/toggle-status   → toggleUserStatus
// ============================================

import { io } from 'socket.io-client';

const API_URL = 'http://localhost:8000/api';
const SOCKET_BASE_URL = 'http://localhost:8000';

// Instancia compartida de Socket.IO. autoConnect:false
// permite controlar manualmente cuándo conectar.
// Es reexportada por Ticketservice para uso en chat.
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error en la petición al servidor');
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
// GET CURRENT USER
// Verifica la sesión activa y retorna los datos
// del usuario autenticado en el panel.
// ============================================
export const getCurrentUser = async () => {
    try {
        const response = await fetch(`${API_URL}/me`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getCurrentUser:', error);
        throw error;
    }
};

// ============================================
// GET USERS
// Retorna el listado de usuarios del sistema.
// Normaliza la respuesta tanto si llega como
// arreglo directo como si viene en { users: [] }.
// ============================================
export const getUsers = async () => {
    try {
        const response = await fetch(`${API_URL}/users`, fetchConfig('GET'));
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data.users || []);
    } catch (error) {
        console.error('Error en getUsers:', error);
        throw error;
    }
};

// ============================================
// GET SECCIONES
// Retorna los módulos/secciones disponibles
// para asignar permisos a los usuarios.
// ============================================
export const getSecciones = async () => {
    try {
        const response = await fetch(`${API_URL}/secciones`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getSecciones:', error);
        throw error;
    }
};

// ============================================
// UPDATE USER
// Actualiza rol, cargo, área y permisos de un
// usuario. Solo envía los campos editables.
// ============================================
export const updateUser = async (id, userData) => {
    try {
        const response = await fetch(`${API_URL}/users/${id}`, fetchConfig('PUT', {
            rol: userData.rol,
            cargo: userData.cargo,
            area: userData.area,
            permisos: userData.permisos,
        }));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en updateUser:', error);
        throw error;
    }
};

// ============================================
// TOGGLE USER STATUS
// Alterna el estado activo/inactivo de un
// usuario. El servidor determina el nuevo estado.
// ============================================
export const toggleUserStatus = async (id) => {
    try {
        const response = await fetch(`${API_URL}/users/${id}/toggle-status`, fetchConfig('PATCH'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en toggleUserStatus:', error);
        throw error;
    }
};