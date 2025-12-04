import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// Base API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:2053/api";

// Storage keys
const TOKEN_KEY = "money_notebook_token";
const CODE_KEY = "money_notebook_code";

// API Response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Token management
export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  removeToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
  getCode: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(CODE_KEY);
  },
  setCode: (code: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CODE_KEY, code);
    }
  },
  removeCode: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CODE_KEY);
    }
  },
  clear: (): void => {
    tokenManager.removeToken();
    tokenManager.removeCode();
  },
};

// Base API class - inherit from this for all services
export class BaseApi {
  protected api: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage for auth
        const token = tokenManager.getToken();

        if (token) {
          config.headers.set("Authorization", `Bearer ${token}`);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        // Handle common errors
        if (error.response) {
          const { status } = error.response;

          if (status === 401) {
            // Unauthorized - clear token and redirect to login
            tokenManager.clear();
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }

          if (status === 500) {
            console.error("Server error:", error.response.data);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // GET request
  protected async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  // POST request
  protected async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  // PUT request
  protected async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  // DELETE request
  protected async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  // Error handler
  private handleError<T>(error: unknown): ApiResponse<T> {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || "Có lỗi xảy ra",
      };
    }
    return {
      success: false,
      error: "Có lỗi xảy ra",
    };
  }
}

// Export singleton instance for direct use
export const baseApi = new BaseApi();
