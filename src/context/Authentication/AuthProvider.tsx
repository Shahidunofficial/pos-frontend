import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../../services/auth.service';
import { AuthState, LoginCredentials, User, StoreSignupData, CreateCashierData, ChangePasswordData } from '../../types/auth.types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authService.login(credentials);
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred during login',
      }));
      throw error;
    }
  };

  const logout = () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      authService.logout();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred during logout',
      }));
    }
  };

  const storeSignup = async (data: StoreSignupData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authService.storeSignup(data);
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred during signup',
      }));
      throw error;
    }
  };

  const createCashier = async (data: CreateCashierData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.createCashier(data);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred while creating cashier',
      }));
      throw error;
    }
  };

  const getAllCashiers = async (): Promise<User[]> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const cashiers = await authService.getAllCashiers();
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
      return cashiers;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching cashiers',
      }));
      throw error;
    }
  };

  const deleteCashier = async (cashierId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.deleteCashier(cashierId);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred while deleting cashier',
      }));
      throw error;
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.changePassword(data);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred while changing password',
      }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        storeSignup,
        createCashier,
        changePassword,
        getAllCashiers,
        deleteCashier,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};