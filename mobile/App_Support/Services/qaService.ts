import axios from 'axios';

const API_URL = 'http://192.168.1.25:8000/api';
//const API_URL = 'http://10.10.0.32:8000/api'; 

export const getFAQs = async () => {
    try {
        const response = await axios.get(`${API_URL}/faqs`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { error: 'Error al cargar FAQs' };
    }
};