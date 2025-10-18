import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  static async getCurrentUser(): Promise<User> {
    return apiRequest('/api/auth/user');
  }

  static async logout(): Promise<{ success: boolean }> {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  }

  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    return apiRequest('/api/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  static setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  static getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  static removeAuthToken(): void {
    localStorage.removeItem('auth_token');
  }

  static isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}