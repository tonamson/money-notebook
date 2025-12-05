import { BaseApi, ApiResponse } from "./api";

export interface User {
  id: number;
  code: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

class AuthService extends BaseApi {
  constructor() {
    super();
  }

  // Login với code - không lưu token, authStore sẽ quản lý
  async login(code: string): Promise<ApiResponse<LoginResponse>> {
    return this.post<LoginResponse>("/auth/login", { code });
  }

  // Tạo mã mới
  async generateCode(): Promise<ApiResponse<{ code: string }>> {
    return this.get<{ code: string }>("/auth/generate-code");
  }
}

// Export singleton instance
export const authService = new AuthService();
