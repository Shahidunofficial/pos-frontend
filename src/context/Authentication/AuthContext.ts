import { createContext } from 'react';
import { AuthContextType } from '../../types/auth.types';

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {},
  storeSignup: async () => {},
  createCashier: async () => {},
  changePassword: async () => {},
  getAllCashiers: async () => [],
  deleteCashier: async () => {},
});