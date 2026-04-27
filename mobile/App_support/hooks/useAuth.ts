import React, { ReactNode, createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import authService from '@/Services/authService';
import * as SecureStore from 'expo-secure-store';

interface User {
  customer_id: number;
  customer_first_name: string;
  customer_second_name?: string;
  customer_last_name: string;
  customer_email: string;
  customer_company: string;
  customer_country_code: string;
  customer_phone: string;
  customer_image: string | null;
  customer_status: number;
}

interface AuthState {
  isLoading: boolean;
  userToken: string | null;
  user: User | null;
  error: string | null;
}

interface AuthContextType {
  state: AuthState;
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
      return { ...state, isLoading: false, userToken: action.payload.token, user: action.payload.user, error: null };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } as User, error: null };
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


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const user = await SecureStore.getItemAsync('user');
        if (token && user) {
          dispatch({ type: 'RESTORE_TOKEN', payload: { token, user: JSON.parse(user) } });
        } else {
          dispatch({ type: 'SIGN_OUT' });
        }
      } catch {
        dispatch({ type: 'SIGN_OUT' });
      }
    };
    bootstrapAsync();
  }, []);


  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      const customer = response.customer;

      await SecureStore.setItemAsync('userToken', customer.customer_id.toString());
      await SecureStore.setItemAsync('user', JSON.stringify(customer));

      dispatch({ type: 'SIGN_IN', payload: { token: customer.customer_id.toString(), user: customer } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.error || 'Credenciales incorrectas' });
      throw error;
    }
  }, []);

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

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('user');
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  return React.createElement(
    AuthContext.Provider,
    { value: { state, login, updateUser, logout, clearError } },
    children
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};