// ============================================
// SERVICIO: GARANTÍAS
// Centraliza las llamadas a la API REST del
// módulo de garantías y expone la instancia de
// Socket.IO para eventos en tiempo real.
//
// GET    /warranty/check/:serial  → checkWarrantySerial
// GET    /warranty                → getWarranties
// POST   /warranty                → createWarranty
// PUT    /warranty/:id            → updateWarranty
// PATCH  /warranty/:id/toggle     → toggleWarrantyStatus
// DELETE /warranty/:id            → deleteWarranty
// GET    /warranty/policy         → getPolicy
// PUT    /warranty/policy         → updatePolicy
// POST   /warranty/bulk-upload    → bulkUploadWarranties
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Error en la petición al servidor');
    }
    return response.json();
};

// ============================================
// FETCH CONFIG
// Construye la configuración fetch unificada.
// Con isFormData:true omite Content-Type para
// que el navegador lo asigne con el boundary.
// ============================================
const fetchConfig = (method, body = null, isFormData = false) => {
    const config = {
        method,
        headers: {},
        credentials: 'include',
    };

    if (!isFormData) {
        config.headers['Content-Type'] = 'application/json';
        if (body) config.body = JSON.stringify(body);
    } else {
        config.body = body;
    }

    return config;
};

// ============================================
// CHECK WARRANTY SERIAL
// Valida si un número de serie tiene garantía
// vigente. El serial se codifica en la URL.
// ============================================
export const checkWarrantySerial = async (serial) => {
    try {
        const response = await fetch(
            `${API_URL}/warranty/check/${encodeURIComponent(serial)}`,
            fetchConfig('GET')
        );
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en checkWarrantySerial:', error);
        throw error;
    }
};

// ============================================
// GET WARRANTIES
// Retorna el listado completo de garantías
// registradas en el sistema.
// ============================================
export const getWarranties = async () => {
    try {
        const response = await fetch(`${API_URL}/warranty`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getWarranties:', error);
        throw error;
    }
};

// ============================================
// CREATE WARRANTY
// Registra una nueva garantía con los datos
// del producto adquirido.
// ============================================
export const createWarranty = async (warrantyData) => {
    try {
        const response = await fetch(`${API_URL}/warranty`, fetchConfig('POST', {
            warranty_serial_number: warrantyData.warranty_serial_number,
            warranty_invoice_number: warrantyData.warranty_invoice_number,
            warranty_purchase_date: warrantyData.warranty_purchase_date,
            warranty_status: warrantyData.warranty_status,
        }));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en createWarranty:', error);
        throw error;
    }
};

// ============================================
// UPDATE WARRANTY
// Actualiza los datos de una garantía existente
// por su ID. No modifica el estado.
// ============================================
export const updateWarranty = async (id, warrantyData) => {
    try {
        const response = await fetch(`${API_URL}/warranty/${id}`, fetchConfig('PUT', {
            warranty_serial_number: warrantyData.warranty_serial_number,
            warranty_invoice_number: warrantyData.warranty_invoice_number,
            warranty_purchase_date: warrantyData.warranty_purchase_date,
        }));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en updateWarranty:', error);
        throw error;
    }
};

// ============================================
// TOGGLE WARRANTY STATUS
// Alterna el estado activo/inactivo de una
// garantía. El servidor determina el nuevo estado.
// ============================================
export const toggleWarrantyStatus = async (id) => {
    try {
        const response = await fetch(`${API_URL}/warranty/${id}/toggle`, fetchConfig('PATCH'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en toggleWarrantyStatus:', error);
        throw error;
    }
};

// ============================================
// DELETE WARRANTY
// Elimina una garantía permanentemente por su ID.
// ============================================
export const deleteWarranty = async (id) => {
    try {
        const response = await fetch(`${API_URL}/warranty/${id}`, fetchConfig('DELETE'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en deleteWarranty:', error);
        throw error;
    }
};

// ============================================
// GET POLICY
// Retorna el texto de la política de garantía
// vigente configurable desde el panel admin.
// ============================================
export const getPolicy = async () => {
    try {
        const response = await fetch(`${API_URL}/warranty/policy`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en getPolicy:', error);
        throw error;
    }
};

// ============================================
// UPDATE POLICY
// Actualiza el contenido de la política de
// garantía visible en la app móvil.
// ============================================
export const updatePolicy = async (data) => {
    try {
        const response = await fetch(`${API_URL}/warranty/policy`, fetchConfig('PUT', data));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en updatePolicy:', error);
        throw error;
    }
};

// ============================================
// BULK UPLOAD WARRANTIES
// Importa garantías masivamente desde un archivo
// (Excel/CSV) enviado como FormData.
// ============================================
export const bulkUploadWarranties = async (fileArchivo) => {
    try {
        const formData = new FormData();
        formData.append('file', fileArchivo);

        const response = await fetch(`${API_URL}/warranty/bulk-upload`, fetchConfig('POST', formData, true));
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en bulkUploadWarranties:', error);
        throw error;
    }
};