import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Business } from '../types';
import { api, isMockMode } from '../services/api';

interface AuthContextType {
  user: User | null;
  business: Business | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMock: boolean;
  login: (email: string, password?: string) => Promise<void>;
  quickDemoLogin: () => Promise<void>;
  register: (data: { email: string; first_name: string; last_name: string; business_name: string; category: string }) => Promise<void>;
  logout: () => void;
  updateBusinessProfile: (data: Partial<Business>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(isMockMode());

  useEffect(() => {
    const { user: savedUser, business: savedBiz, token: savedToken } = api.getCurrentUser();
    if (savedUser && savedToken) {
      setUser(savedUser);
      setBusiness(savedBiz);
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const result = await api.login(email);
      setUser(result.user);
      setBusiness(result.business);
      setToken(result.token);
      setIsMock(isMockMode());
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async () => {
    setIsLoading(true);
    try {
      const result = await api.login('marcus@apexgrooming.com');
      setUser(result.user);
      setBusiness(result.business);
      setToken(result.token);
      setIsMock(isMockMode());
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; first_name: string; last_name: string; business_name: string; category: string }) => {
    setIsLoading(true);
    try {
      const result = await api.register(data);
      setUser(result.user);
      setBusiness(result.business);
      setToken(result.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setBusiness(null);
    setToken(null);
  };

  const updateBusinessProfile = async (data: Partial<Business>) => {
    const updated = await api.updateBusiness(data);
    setBusiness(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isMock,
        login,
        quickDemoLogin,
        register,
        logout,
        updateBusinessProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
