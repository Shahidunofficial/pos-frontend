export interface User {
  id: string;
  email?: string;
  username?: string;
  role: 'admin' | 'cashier';
  name: string;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
  role: 'admin' | 'cashier';
}

export interface StoreSignupData {
  storeName: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
}

export interface CreateCashierData {
  username: string;
  password: string;
  name: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  storeSignup: (data: StoreSignupData) => Promise<void>;
  createCashier: (data: CreateCashierData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  getAllCashiers: () => Promise<User[]>;
  deleteCashier: (cashierId: string) => Promise<void>;
}