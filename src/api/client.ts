import { AuthTokens, ApiError } from '@/models/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.loadTokens();
  }

  private loadTokens() {
    try {
      const tokens = localStorage.getItem('safewalk_tokens');
      if (tokens) {
        const parsed = JSON.parse(tokens) as AuthTokens;
        this.accessToken = parsed.accessToken;
        this.refreshToken = parsed.refreshToken;
      }
    } catch {
      this.clearTokens();
    }
  }

  setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    localStorage.setItem('safewalk_tokens', JSON.stringify(tokens));
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('safewalk_tokens');
  }

  getAccessToken() {
    return this.accessToken;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/v1/auth/refresh?refreshToken=${encodeURIComponent(this.refreshToken!)}`,
          { method: 'POST' }
        );

        if (!response.ok) {
          this.clearTokens();
          return false;
        }

        const tokens: AuthTokens = await response.json();
        this.setTokens(tokens);
        return true;
      } catch {
        this.clearTokens();
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth = true,
    retryOnUnauthorized = true
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (requiresAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && requiresAuth && retryOnUnauthorized) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request<T>(endpoint, options, requiresAuth, false);
        }
        throw { status: 401, message: 'Session expired. Please login again.' } as ApiError;
      }

      if (!response.ok) {
        let errorData: ApiError;
        try {
          errorData = await response.json();
        } catch {
          errorData = { status: response.status, message: response.statusText };
        }
        throw { ...errorData, status: response.status } as ApiError;
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) return {} as T;
      
      return JSON.parse(text) as T;
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw { status: 0, message: 'Network error. Please check your connection.' } as ApiError;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthTokens> {
    const tokens = await this.request<AuthTokens>(
      `/api/v1/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      { method: 'POST' },
      false
    );
    this.setTokens(tokens);
    return tokens;
  }

  async register(data: { name: string; email: string; phoneNumber: string; password: string }): Promise<AuthTokens> {
    const tokens = await this.request<AuthTokens>(
      '/api/v1/auth/register',
      { method: 'POST', body: JSON.stringify(data) },
      false
    );
    this.setTokens(tokens);
    return tokens;
  }

  logout() {
    this.clearTokens();
  }
}

export const apiClient = new ApiClient();
export default apiClient;
