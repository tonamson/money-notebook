import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService, User, LoginResponse } from "../services/authService";
import { ApiResponse } from "../services/api";

// Storage keys
const STORAGE_KEY = "money-notebook-auth";

interface AuthState {
  // State
  user: User | null;
  userCode: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (code: string) => Promise<ApiResponse<LoginResponse>>;
  logout: () => void;
  generateCode: () => Promise<ApiResponse<{ code: string }>>;
  setLoading: (loading: boolean) => void;

  // Token helpers
  getToken: () => string | null;
  getCode: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      userCode: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      // Login action
      login: async (code: string) => {
        const response = await authService.login(code);

        if (response.success && response.data) {
          set({
            user: response.data.user,
            userCode: code.toUpperCase(),
            accessToken: response.data.accessToken,
            isAuthenticated: true,
          });
        }

        return response;
      },

      // Logout action
      logout: () => {
        set({
          user: null,
          userCode: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      // Generate new code
      generateCode: async () => {
        return authService.generateCode();
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Token helpers for API interceptor
      getToken: () => get().accessToken,
      getCode: () => get().userCode,
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        userCode: state.userCode,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Set loading to false after rehydration
        state?.setLoading(false);
      },
    }
  )
);
