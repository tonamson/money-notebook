import { BaseApi, ApiResponse, tokenManager } from "./api";

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

  // Login với code
  async login(code: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.post<LoginResponse>("/auth/login", { code });

    if (response.success && response.data) {
      // Lưu token và code
      tokenManager.setToken(response.data.accessToken);
      tokenManager.setCode(code);
    }

    return response;
  }

  // Tạo mã mới
  async generateCode(): Promise<ApiResponse<{ code: string }>> {
    return this.get<{ code: string }>("/auth/generate-code");
  }

  // Logout
  logout(): void {
    tokenManager.clear();
  }

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated(): boolean {
    return !!tokenManager.getToken();
  }

  // Lấy code đã lưu
  getSavedCode(): string | null {
    return tokenManager.getCode();
  }
}

// Export singleton instance
export const authService = new AuthService();
