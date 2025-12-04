"use client";

import { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import { authService } from "./services/authService";

export default function Home() {
  const [userCode, setUserCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra nếu đã có token và code
    if (authService.isAuthenticated()) {
      const savedCode = authService.getSavedCode();
      if (savedCode) {
        setUserCode(savedCode);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (code: string) => {
    setUserCode(code);
  };

  const handleLogout = () => {
    authService.logout();
    setUserCode(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!userCode) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard userCode={userCode} onLogout={handleLogout} />;
}
