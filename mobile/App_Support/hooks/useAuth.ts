import React, { ReactNode, createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import authService from '@/Services/authService';
import * as SecureStore from 'expo-secure-store';

interface User {
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_company: string;
  customer_country_code: string;
  customer_phone: string;
  customer_password: string;
  customer_image: string | null;
}

interface AuthState {
  isLoading: boolean;
  userToken: string | null;
  user: User | null;
  error: string | null;
}

interface AuthContextType {
  state: AuthState;
  register: (userData: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  updateUser: (id: number, formData: FormData) => Promise<any>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  isLoading: true,
  userToken: null,
  user: null,
  error: null,
};

type AuthAction =
  | { type: 'RESTORE_TOKEN'; payload: { token: string; user: User } }
  | { type: 'SIGN_IN'; payload: { token: string; user: User } }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
    case 'SIGN_IN':
      return {
        ...state,
        isLoading: false,
        userToken: action.payload.token,
        user: action.payload.user,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload } as User,
        error: null,
      };
    case 'SIGN_OUT':
      return { ...initialState, isLoading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        //para limpiar el token en desarrollo
        //await SecureStore.deleteItemAsync('userToken');
        //await SecureStore.deleteItemAsync('user');

        const token = await SecureStore.getItemAsync('userToken');
        const user = await SecureStore.getItemAsync('user');

        if (token && user) {
          dispatch({
            type: 'RESTORE_TOKEN',
            payload: { token, user: JSON.parse(user) },
          });
        } else {
          dispatch({ type: 'SIGN_OUT' });
        }
      } catch (e) {
        console.error('Error restaurando token:', e);
        dispatch({ type: 'SIGN_OUT' });
      }
    };
    bootstrapAsync();
  }, []);

  // ============================================
  // REGISTRO
  // ============================================
  const register = useCallback(async (userData: any) => {
    try {
      await authService.register(userData);
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.error || 'Error en registro',
      });
      throw error;
    }
  }, []);

  // ============================================
  // LOGIN
  // ============================================
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      const userStr = JSON.stringify(response);

      await SecureStore.setItemAsync('userToken', response.customer_id.toString());
      await SecureStore.setItemAsync('user', userStr);

      dispatch({
        type: 'SIGN_IN',
        payload: { token: response.customer_id.toString(), user: response },
      });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.error || 'Credenciales incorrectas' });
      throw error;
    }
  }, []);

  // ============================================
  // ACTUALIZAR USUARIO
  // ============================================
  const updateUser = useCallback(async (id: number, formData: FormData) => {
    try {
      const response = await authService.updateCustomer(id, formData);
      const updatedUser = response.customer;

      if (updatedUser) {
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      }
      return response;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.error || 'Error al actualizar' });
      throw error;
    }
  }, []);

  // ============================================
  // LOGOUT
  // ============================================
  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('user');
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);
  const value = { state, register, login, updateUser, logout, clearError };
  return React.createElement(AuthContext.Provider, { value }, children);

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};