"use client";

import { createContext, useContext, useEffect, useState } from "react";

import type { ReactNode } from "react";

type AuthContextType = {
  token: string | null;
  userId: string | null;
  username: string | null;
  isLogged: boolean;
  authLoading: boolean;
  login: (
    token: string,
    userId: string,
    username: string,
    expireInMs?: number,
  ) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const isLogged = !!token;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const expiry = localStorage.getItem("expiryDate");
    const username = localStorage.getItem("username");

    if (storedToken && expiry && new Date(expiry) > new Date()) {
      setToken(storedToken);
      setUserId(storedUserId);
      setUsername(username);

      const msLeft = new Date(expiry).getTime() - Date.now();
      setAutoLogout(msLeft);
    } else {
      clearStorage();
    }

    setAuthLoading(false);
  }, []);

  const login = (
    newToken: string,
    newUserId: string,
    newUsername: string,
    expiresInMs: number = 60 * 60 * 1000,
  ) => {
    const expiryDate = new Date(Date.now() + expiresInMs);
    setToken(newToken);
    setUserId(newUserId);
    setUsername(newUsername);

    localStorage.setItem("token", newToken);
    localStorage.setItem("userId", newUserId);
    localStorage.setItem("expiryDate", expiryDate.toISOString());
    localStorage.setItem("username", newUsername);

    setAutoLogout(expiresInMs);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    clearStorage();
  };

  let logoutTimer: ReturnType<typeof setTimeout>;
  const setAutoLogout = (ms: number) => {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(logout, ms);
  };

  const clearStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("expiryDate");
  };

  return (
    <AuthContext.Provider
      value={{ token, userId, isLogged, logout, login, username, authLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado com AuthProvider");
  }

  return context;
}
