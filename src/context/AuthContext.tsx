import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = api.getStoredAuthUser();
        if (stored) {
          setUser(stored);
        } else {
          const users = await api.getUsers();
          const defaultEmployee = users.find((u) => u.email === 'employee@company.com') || users[1];
          if (defaultEmployee) {
            setUser(defaultEmployee);
            api.setStoredAuthUser(defaultEmployee);
          }
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, _password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const users = await api.getUsers();
      const trimmedEmail = email.trim().toLowerCase();
      const matchedUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);

      if (!matchedUser) {
        setIsLoading(false);
        return { success: false, error: 'User with this email does not exist.' };
      }

      setUser(matchedUser);
      api.setStoredAuthUser(matchedUser);
      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const loginAsDemo = async (targetRole: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const users = await api.getUsers();
      const demoUser = users.find((u) => u.role === targetRole);
      if (demoUser) {
        setUser(demoUser);
        api.setStoredAuthUser(demoUser);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    api.setStoredAuthUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemo,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
