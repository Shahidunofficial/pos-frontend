import { userAPI, LoginRequest, StoreSignupRequest, CreateCashierRequest, ChangePasswordRequest } from '../API/userAPI';
import { User, LoginCredentials, StoreSignupData, CreateCashierData, ChangePasswordData } from '../types/auth.types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    const loginData: LoginRequest = {
      password: credentials.password,
      role: credentials.role,
    };

    // Add email for admin or username for cashier
    if (credentials.role === 'admin') {
      loginData.email = credentials.email;
    } else {
      loginData.username = credentials.username;
    }

    const response = await userAPI.login(loginData);
    return response.user;
  }

  async storeSignup(data: StoreSignupData): Promise<User> {
    const signupData: StoreSignupRequest = {
      storeName: data.storeName,
      adminEmail: data.adminEmail,
      adminPassword: data.adminPassword,
      adminName: data.adminName,
    };

    const response = await userAPI.storeSignup(signupData);
    return response.user;
  }

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    return userAPI.getProfile();
  }

  async createCashier(data: CreateCashierData): Promise<User> {
    const cashierData: CreateCashierRequest = {
      username: data.username,
      password: data.password,
      name: data.name,
    };

    const response = await userAPI.createCashier(cashierData);
    return response.user;
  }

  async getAllCashiers(): Promise<User[]> {
    return userAPI.getAllCashiers();
  }

  async deleteCashier(cashierId: string): Promise<void> {
    await userAPI.deleteCashier(cashierId);
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    const passwordData: ChangePasswordRequest = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };

    await userAPI.changePassword(passwordData);
  }

  async validateUser(identifier: string, role: 'admin' | 'cashier'): Promise<User> {
    if (role === 'admin') {
      return userAPI.validateUser(identifier, undefined, role);
    } else {
      return userAPI.validateUser(undefined, identifier, role);
    }
  }

  logout(): void {
    userAPI.logout();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();