"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  role?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    if (typeof window !== "undefined" && userData.token) {
      localStorage.setItem("userToken", userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("userToken");
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
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
