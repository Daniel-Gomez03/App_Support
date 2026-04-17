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
        throw new Error(errorData.error || errorData.message || 'Error en la petición al servidor');
    }
    return await response.json();
};

const fetchConfig = (method, body = null, isFormData = false) => {
    const config = {
        method: method,
        headers: {},
        credentials: 'include'
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
// OBTENER TODAS LAS GARANTÍAS
// ============================================
export const getWarranties = async () => {
    try {
        const response = await fetch(`${API_URL}/warranty`, fetchConfig('GET'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en getWarranties:", error);
        throw error;
    }
};

// ============================================
// CREAR UNA NUEVA GARANTÍA
// ============================================
export const createWarranty = async (warrantyData) => {
    try {
        const response = await fetch(`${API_URL}/warranty`, fetchConfig('POST', {
            warranty_serial_number: warrantyData.warranty_serial_number,
            warranty_invoice_number: warrantyData.warranty_invoice_number,
            warranty_purchase_date: warrantyData.warranty_purchase_date,
            warranty_status: warrantyData.warranty_status
        }));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en createWarranty:", error);
        throw error;
    }
};

// ============================================
// ACTUALIZAR GARANTÍA
// ============================================
export const updateWarranty = async (id, warrantyData) => {
    try {
        const response = await fetch(`${API_URL}/warranty/${id}`, fetchConfig('PUT', {
            warranty_serial_number: warrantyData.warranty_serial_number,
            warranty_invoice_number: warrantyData.warranty_invoice_number,
            warranty_purchase_date: warrantyData.warranty_purchase_date
        }));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en updateWarranty:", error);
        throw error;
    }
};

// ============================================
// CAMBIAR ESTADO (TOGGLE)
// ============================================
export const toggleWarrantyStatus = async (id) => {
    try {
        const response = await fetch(`${API_URL}/warranty/${id}/toggle`, fetchConfig('PATCH'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en toggleWarrantyStatus:", error);
        throw error;
    }
};

// ============================================
// ELIMINAR GARANTÍA
// ============================================
export const deleteWarranty = async (id) => {
    try {
        const response = await fetch(`${API_URL}/warranty/${id}`, fetchConfig('DELETE'));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en deleteWarranty:", error);
        throw error;
    }
};

// ============================================
// CARGA MASIVA 
// ============================================
export const bulkUploadWarranties = async (fileArchivo) => {
    try {
        const formData = new FormData();
        formData.append('file', fileArchivo);

        const response = await fetch(`${API_URL}/warranty/bulk-upload`, fetchConfig('POST', formData, true));
        return await handleResponse(response);
    } catch (error) {
        console.error("Error en bulkUploadWarranties:", error);
        throw error;
    }
};