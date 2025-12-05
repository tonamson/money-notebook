"use client";

import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import { useAuthStore } from "./stores/authStore";

export default function Home() {
  const { userCode, isAuthenticated, isLoading, logout } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !userCode) {
    return <LoginForm />;
  }

  return <Dashboard userCode={userCode} onLogout={logout} />;
}
