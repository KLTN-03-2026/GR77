"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { API_BASE_URL } from "@/lib/constants/endpoints";

interface User {
  id: string;
  email: string;
  username: string;
  role?: string;
  accessToken?: string;
  refreshToken?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  wallet?: {
    balance: number;
    walletAddress?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isAdminRole(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục session khi load trang
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Regular user token takes priority over admin token
        const accessToken = localStorage.getItem("accessToken") || localStorage.getItem("adminAccessToken");
        const refreshToken = localStorage.getItem("refreshToken") || localStorage.getItem("adminRefreshToken");
        const storedUser = localStorage.getItem("user");

        if (accessToken && storedUser) {
          // Khôi phục tạm thời từ cache để UI không bị giật
          setUser({ ...JSON.parse(storedUser), accessToken, refreshToken: refreshToken ?? undefined });

          // Fetch dữ liệu mới nhất từ DB (bao gồm avatarUrl mới nhất)
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (res.ok) {
            const freshData = await res.json();
            setUser({ ...freshData, accessToken, refreshToken: refreshToken ?? undefined });
            localStorage.setItem("user", JSON.stringify(freshData));
          }
        }
      } catch (error) {
        console.warn("Failed to restore auth session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData: User) => {
    const { accessToken, refreshToken, ...userInfo } = userData;
    const role = userInfo.role;

    setUser(userData);

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userInfo));

      if (isAdminRole(role)) {
        // Admin tokens go to admin-specific keys
        if (accessToken) localStorage.setItem("adminAccessToken", accessToken);
        if (refreshToken) localStorage.setItem("adminRefreshToken", refreshToken);
        localStorage.setItem("adminUserName", userInfo.email.split('@')[0]);
      } else {
        // Regular user tokens
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userName", userInfo.username || userInfo.email.split('@')[0]);
      }
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userName");
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      localStorage.removeItem("adminUserName");
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };

      // Sync to localStorage
      const { accessToken, refreshToken, ...userInfo } = updated;
      localStorage.setItem("user", JSON.stringify(userInfo));

      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useGlobalAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useGlobalAuth must be used within an AuthProvider");
  }
  return context;
}
