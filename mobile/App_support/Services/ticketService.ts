import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.18:8000/api';

const authHeader = async (): Promise<Record<string, string>> => {
    const token = await SecureStore.getItemAsync('userToken');
    return { Authorization: `Bearer ${token ?? ''}` };
};

const ticketService = {
    getTicketById: async (id: string | number) => {
        const headers = await authHeader();
        const res = await fetch(`${API_URL}/mobile/tickets/${id}`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener el ticket');
        return data;
    },

    getTicketComments: async (id: string | number) => {
        const headers = await authHeader();
        const res = await fetch(`${API_URL}/mobile/tickets/${id}/comments`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener los comentarios');
        return Array.isArray(data) ? data : [];
    },

    sendComment: async (
        id: string | number,
        text: string,
        files: Array<{ uri: string; type: string }>
    ) => {
        const token = await SecureStore.getItemAsync('userToken');
        const formData = new FormData();
        formData.append('comment_text', text || '📎 Archivo adjunto');

        files.forEach((file) => {
            const uri = file.uri;
            const fileName = uri.split('/').pop() ?? 'file';
            const ext = fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
            const mimeType =
                file.type === 'video'
                    ? 'video/mp4'
                    : `image/${ext === 'png' ? 'png' : 'jpeg'}`;
            formData.append('attachments', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: fileName,
                type: mimeType,
            } as any);
        });

        const res = await fetch(`${API_URL}/mobile/tickets/${id}/comments`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al enviar el mensaje');
        return data;
    },

    requestCancellation: async (id: string | number) => {
        const headers = await authHeader();
        const res = await fetch(`${API_URL}/mobile/tickets/${id}/cancel`, {
            method: 'PATCH',
            headers,
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Error al solicitar cancelación');
        }
    },
};

export default ticketService;