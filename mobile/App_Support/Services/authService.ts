import axios from 'axios';

//const API_URL = 'http://192.168.1.19:8000/api'; 
const API_URL = 'http://10.10.0.37:8000/api';

const authService = {
    // ============================================
    // LOGIN
    // ============================================
    login: async (customer_email: string, customer_password: string) => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                customer_email,
                customer_password,
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Error en login' };
        }
    },
    
    // ============================================
    // REGISTRO
    // ============================================
    register: async (userData: {
        customer_name: string;
        customer_email: string;
        customer_phone: string;
        customer_country_code: string;
        customer_company: string;
        customer_password: string;
    }) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Error en registro' };
        }
    },

    // ============================================
    // OBTENER CLIENTE POR ID
    // ============================================
    getCustomerById: async (customerId: number) => {
        try {
            const response = await axios.get(`${API_URL}/customers/${customerId}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Error al obtener cliente' };
        }
    },
};

export default authService;