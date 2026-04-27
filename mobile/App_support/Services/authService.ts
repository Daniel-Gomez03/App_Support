import axios from "axios";

const API_URL = "http://192.168.1.18:8000/api";

export interface RegisterPayload {
  // Paso 1
  customer_first_name: string;
  customer_second_name?: string;
  customer_last_name: string;
  customer_second_last_name?: string;
  customer_email: string;
  customer_country_code: string;
  customer_phone: string;
  // Paso 2
  customer_company: string;
  validation_type: "serie" | "factura";
  validation_value: string;
  // Paso 3
  customer_password: string;
  // Política
  accepted_policy_version: string;
}

export interface WarrantyValidationResult {
  exists: boolean;
  is_expired?: boolean;
  expiry_date?: string;
  message: string;
}

export interface PolicySection {
  title: string;
  items: Array<{ key: string; text: string }>;
}

export interface WarrantyPolicy {
  policy_id: number;
  policy_version: string;
  policy_updated_label: string;
  policy_content: PolicySection[];
}

const authService = {
  // ============================================
  // LOGIN
  // ============================================
  login: async (customer_email: string, customer_password: string) => {
    try {
      const response = await axios.post(`${API_URL}/mobile/login`, {
        customer_email,
        customer_password,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: "Error en login" };
    }
  },

  // ============================================
  // REGISTRO (3 pasos)
  // ============================================
  register: async (payload: RegisterPayload) => {
    try {
      const response = await axios.post(`${API_URL}/mobile/register`, payload);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: "Error en registro" };
    }
  },

  // ============================================
  // VALIDAR GARANTÍA (Paso 2)
  // ============================================
  validateWarranty: async (
    type: "serie" | "factura",
    value: string,
  ): Promise<WarrantyValidationResult> => {
    try {
      const response = await axios.get(`${API_URL}/mobile/validate-warranty`, {
        params: { type, value },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: "Error al validar garantía" };
    }
  },

  // ============================================
  // POLÍTICA DE GARANTÍA
  // ============================================
  getWarrantyPolicy: async (): Promise<WarrantyPolicy> => {
    try {
      const response = await axios.get(`${API_URL}/mobile/warranty-policy`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: "Error al obtener la política" };
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
      throw error.response?.data || { error: "Error al obtener cliente" };
    }
  },

  // ============================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ============================================
  forgotPassword: async (customer_email: string) => {
    try {
      const response = await axios.post(`${API_URL}/mobile/forgot-password`, {
        customer_email,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: "Error al enviar el correo" };
    }
  },

  resetPassword: async (token: string, new_password: string) => {
    try {
      const response = await axios.post(`${API_URL}/mobile/reset-password`, {
        token,
        new_password,
      });
      return response.data;
    } catch (error: any) {
      throw (
        error.response?.data || { error: "Error al restablecer la contraseña" }
      );
    }
  },

  // ============================================
  // ACTUALIZAR CLIENTE
  // ============================================
  updateCustomer: async (customerId: number | string, formData: any) => {
    try {
      const response = await fetch(`${API_URL}/customers/${customerId}`, {
        method: "PUT",
        body: formData,
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      if (!response.ok) throw data;
      return data;
    } catch (error: any) {
      if (error.error) throw error;
      throw { error: "Error de conexión al actualizar el perfil" };
    }
  },
};

export default authService;
