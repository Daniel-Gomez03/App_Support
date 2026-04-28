import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://10.10.0.84:8000/api';

const authHeader = async (): Promise<Record<string, string>> => {
    const token = await SecureStore.getItemAsync('userToken');
    return { Authorization: `Bearer ${token ?? ''}` };
};

const nuevoService = {
    getCategories: async () => {
        const headers = await authHeader();
        const res = await fetch(`${API_URL}/mobile/categories`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener categorías');
        return data;
    },

    getProductsByCategory: async (category_id: number) => {
        const headers = await authHeader();
        const res = await fetch(`${API_URL}/mobile/categories/${category_id}/products`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener productos');
        return data;
    },

    getModelsByProduct: async (product_id: number) => {
        const headers = await authHeader();
        const res = await fetch(`${API_URL}/mobile/products/${product_id}/models`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener modelos');
        return data;
    },

    checkWarrantyBySerial: async (serial: string) => {
        const res = await fetch(`${API_URL}/mobile/validate-warranty?type=serie&value=${encodeURIComponent(serial)}`);
        const data = await res.json();
        if (!res.ok) return { exists: false, is_expired: false };
        return data as { exists: boolean; is_expired: boolean; expiry_date?: string };
    },

    createTicket: async (ticketData: any, files: any[]) => {
        const token = await SecureStore.getItemAsync('userToken');
        const formData = new FormData();

        formData.append('category_id', ticketData.category_id.toString());
        formData.append('ticket_subject', ticketData.ticket_subject);
        formData.append('ticket_description', ticketData.ticket_description);

        if (ticketData.product_id)
            formData.append('product_id', ticketData.product_id.toString());
        if (ticketData.product_model_id)
            formData.append('product_model_id', ticketData.product_model_id.toString());
        if (ticketData.ticket_serial_number)
            formData.append('ticket_serial_number', ticketData.ticket_serial_number);

        files.forEach(file => {
            const uri = file.uri;
            const fileName = file.name || uri.split('/').pop();
            const ext = fileName.split('.').pop()?.toLowerCase();
            let type = `image/${ext === 'png' ? 'png' : 'jpeg'}`;
            if (file.type === 'video' || ext === 'mp4') type = 'video/mp4';

            formData.append('evidences', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: fileName,
                type,
            } as any);
        });

        const res = await fetch(`${API_URL}/mobile/tickets`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Error al crear el ticket');
        return result;
    },

    getTicketsByCustomer: async (customerId: number) => {
        const headers = await authHeader();
        const res = await fetch(`${API_URL}/tickets/customer/${customerId}`, { headers });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Error al obtener historial');
        return result;
    },

    getActiveTicketsByCustomer: async () => {
        const headers = await authHeader();
        const res = await fetch(`${API_URL}/mobile/tickets/active`, { headers });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Error al obtener tickets activos');
        return result;
    },

    getHistoryTickets: async () => {
        const headers = await authHeader();
        const res = await fetch(`${API_URL}/mobile/tickets/history`, { headers });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Error al obtener historial');
        return result;
    },
};

export default nuevoService;