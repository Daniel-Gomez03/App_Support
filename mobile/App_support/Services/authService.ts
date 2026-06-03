// ============================================
// SERVICIO: AUTENTICACIÓN (authService)
// Endpoints del módulo mobile: login, registro,
// validación de garantía, política, perfil y
// recuperación de contraseña.
// Endpoints públicos usan axios; los autenticados
// (changePassword, updateProfile) usan fetch nativo
// para adjuntar el token de SecureStore y enviar
// multipart/form-data sin conflictos con axios.
// ============================================

import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_URL = "http://192.168.1.20:8000/api";

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
  // CAMBIAR CONTRASEÑA (MÓVIL)
  // ============================================
  changePassword: async (current_password: string, new_password: string) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const response = await fetch(`${API_URL}/mobile/change-password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ current_password, new_password }),
      });
      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error: any) {
      if (error.error) throw error;
      throw { error: "Error de conexión al cambiar la contraseña" };
    }
  },

  // ============================================
  // ACTUALIZAR PERFIL (MÓVIL)
  // ============================================
  updateProfile: async (
    data: {
      customer_first_name?: string;
      customer_second_name?: string | null;
      customer_last_name?: string;
      customer_second_last_name?: string | null;
      customer_phone?: string;
      customer_country_code?: string;
    },
    imageUri?: string | null
  ) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value ?? "");
      });

      if (imageUri) {
        const fileName = imageUri.split("/").pop() ?? `profile_${Date.now()}.jpg`;
        const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
        formData.append("image", {
          uri: Platform.OS === "android" ? imageUri : imageUri.replace("file://", ""),
          name: fileName,
          type: ext === "png" ? "image/png" : "image/jpeg",
        } as any);
      }

      const response = await fetch(`${API_URL}/mobile/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error: any) {
      if (error.error) throw error;
      throw { error: "Error de conexión al actualizar el perfil" };
    }
  },
};

export default authService;