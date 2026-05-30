import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.18:8000/api';

const authHeader = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getFAQs = async () => {
    const headers = await authHeader();
    const response = await axios.get(`${API_URL}/mobile/faqs`, { headers });
    return response.data;
};