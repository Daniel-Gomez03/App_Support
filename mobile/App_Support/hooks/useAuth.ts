import React, { ReactNode } from 'react';
import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import authService from '@/Services/authService';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  isLoading: boolean;
  userToken: string | null;
  user: {
    customer_id: number;
    customer_name: string;
    customer_email: string;
    customer_company: string;
  } | null;
  error: string | null;
}

interface AuthContextType {
  state: AuthState;
  register: (userData: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
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
  | { type: 'RESTORE_TOKEN'; payload: { token: string; user: any } }
  | { type: 'SIGN_IN'; payload: { token: string; user: any } }
  | { type: 'SIGN_UP'; payload: { token: string; user: any } }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        isLoading: false,
        userToken: action.payload.token,
        user: action.payload.user,
      };
    case 'SIGN_IN':
      return {
        ...state,
        isLoading: false,
        userToken: action.payload.token,
        user: action.payload.user,
        error: null,
      };
    case 'SIGN_UP':
      return {
        ...state,
        isLoading: false,
        userToken: action.payload.token,
        user: action.payload.user,
        error: null,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isLoading: false,
        userToken: null,
        user: null,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
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
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('user');

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
      const response = await authService.register(userData);
    } catch (error: any) {
      console.error('Error en registro:', error);
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

      await SecureStore.setItemAsync('userToken', response.customer_id.toString());
      await SecureStore.setItemAsync(
        'user',
        JSON.stringify({
          customer_id: response.customer_id,
          customer_name: response.customer_name,
          customer_email: response.customer_email,
          customer_company: response.customer_company,
        })
      );

      dispatch({
        type: 'SIGN_IN',
        payload: {
          token: response.customer_id.toString(),
          user: {
            customer_id: response.customer_id,
            customer_name: response.customer_name,
            customer_email: response.customer_email,
            customer_company: response.customer_company,
          },
        },
      });
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.error || 'Email o contraseña incorrectos',
      });
      throw error;
    }
  }, []);

  // ============================================
  // LOGOUT
  // ============================================
  const logout = useCallback(async () => {
    try {

      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('user');
      dispatch({ type: 'SIGN_OUT' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Error al cerrar sesión',
      });
    }
  }, []);

  // ============================================
  // CLEAR ERROR
  // ============================================
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextType = {
    state,
    register,
    login,
    logout,
    clearError,
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};