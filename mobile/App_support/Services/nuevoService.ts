import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = 'http://192.168.1.26:8000/api';

const nuevoService = {
    //Obtener todas las categorias
    getCategories: async () => {
        try {
            const response = await axios.get(`${API_URL}/categories`);
            return response.data;
        } catch (error) {
            console.error("Error en getCategories Service:", error);
            throw error;
        }
    },

    //Obtener productos por categoria
    getProductsByCategory: async (category_id: any) => {
        try {
            const response = await axios.get(`${API_URL}/products`);
            const allProducts = response.data;

            return allProducts.filter((p: any) => p.category_id === category_id);
        } catch (error) {
            console.error("Error en getProductsByCategory:", error);
            return [];
        }
    },

    // Obtener modelos filtrados por el producto
    getModelsByProduct: async (product_id: any) => {
        try {
            const response = await axios.get(`${API_URL}/product/${product_id}/models`);
            return response.data;
        } catch (error) {
            console.error("Error en getModelsByProduct:", error);
            return [];
        }
    },

    // Crear ticket
    createTicket: async (ticketData: any, files: any[]) => {
        try {
            const formData = new FormData();

            // Datos del Ticket
            formData.append('customer_id', ticketData.customer_id.toString());
            formData.append('category_id', ticketData.category_id.toString());
            formData.append('product_id', ticketData.product_id ? ticketData.product_id.toString() : '');
            formData.append('ticket_subject', ticketData.ticket_subject);
            formData.append('ticket_description', ticketData.ticket_description);

            if (ticketData.product_model_id) {
                formData.append('product_model_id', ticketData.product_model_id.toString());
            }
            if (ticketData.ticket_serial_number) {
                formData.append('ticket_serial_number', ticketData.ticket_serial_number);
            }

            // Procesar Archivos
            files.forEach((file, index) => {
                const uri = file.uri;
                const fileName = file.name || uri.split('/').pop();
                const extension = fileName.split('.').pop()?.toLowerCase();

                let type = '';
                if (extension === 'pdf') {
                    type = 'application/pdf';
                } else if (file.type === 'video' || extension === 'mp4') {
                    type = 'video/mp4';
                } else {
                    type = `image/${extension === 'png' ? 'png' : 'jpeg'}`;
                }

                formData.append('evidences', {
                    uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                    name: fileName,
                    type: type,
                } as any);
            });

            const response = await fetch(`${API_URL}/tickets`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al crear el ticket');
            }

            return result;

        } catch (error: any) {
            console.error("Error en createTicket (Fetch):", error.message);
            throw error;
        }
    },
    //Tickets segun el usuario logueado (historial)
    getTicketsByCustomer: async (customerId: number) => {
        try {
            const response = await fetch(`${API_URL}/tickets/customer/${customerId}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al obtener historial');
            return result; 
        } catch (error) {
            throw error;
        }
    },
    // Obtener tickets activos del usuario 
    getActiveTicketsByCustomer: async (customerId: number) => {
        try {
            const response = await fetch(`${API_URL}/tickets/active/${customerId}`);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Error al obtener tickets activos');
            }
            
            return result; 
        } catch (error) {
            console.error("Error en getActiveTicketsByCustomer:", error);
            throw error;
        }
    }
};

export default nuevoService;