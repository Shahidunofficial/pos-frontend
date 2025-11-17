"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
  role: 'admin' | 'cashier';
}

export interface StoreSignupRequest {
  storeName: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
}

export interface CreateCashierRequest {
  username: string;
  password: string;
  name: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  id: string;
  email?: string;
  username?: string;
  role: 'admin' | 'cashier';
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
  message?: string;
}

class UserAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Request failed');
    }
    return response.json();
  }

  // Store signup (first time setup)
  async storeSignup(data: StoreSignupRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/store-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await this.handleResponse<AuthResponse>(response);
    if (result.access_token) {
      localStorage.setItem('auth_token', result.access_token);
    }
    return result;
  }

  // Login
  async login(data: LoginRequest): Promise<AuthResponse> {
    console.log('🔐 Sending login request:', data);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    console.log('📥 Login response status:', response.status, response.statusText);
    
    const result = await this.handleResponse<AuthResponse>(response);
    if (result.access_token) {
      localStorage.setItem('auth_token', result.access_token);
      console.log('✅ Token stored successfully');
    }
    return result;
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<User>(response);
  }

  // Validate user exists (for email/username step)
  async validateUser(email?: string, username?: string, role?: string): Promise<User> {
    const body = role === 'admin' ? { email, role } : { username, role };
    
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    return this.handleResponse<User>(response);
  }

  // Admin: Create cashier account
  async createCashier(data: CreateCashierRequest): Promise<{ message: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/cashiers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<{ message: string; user: User }>(response);
  }

  // Admin: Get all cashiers
  async getAllCashiers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/auth/cashiers`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<User[]>(response);
  }

  // Admin: Delete cashier
  async deleteCashier(cashierId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/cashiers/${cashierId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<{ message: string }>(response);
  }

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<{ message: string }>(response);
  }

  // Logout
  logout(): void {
    localStorage.removeItem('auth_token');
  }
}

export const userAPI = new UserAPI();
