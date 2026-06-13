// ============================================
// SERVICIO: FAQ (qaService)
// Obtiene las preguntas frecuentes del backend.
// ============================================

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://10.86.65.105:8000/api';

const authHeader = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getFAQs = async () => {
    const headers = await authHeader();
    const response = await axios.get(`${API_URL}/mobile/faqs`, { headers });
    return response.data;
};