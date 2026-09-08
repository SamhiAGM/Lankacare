'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface RegisteredUser extends User {
  nic?: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsDemo: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  register: (data: Partial<User> & { password?: string; nic?: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getRegisteredUsers = (): RegisteredUser[] => {
  const users = localStorage.getItem('moh_registered_users');
  return users ? JSON.parse(users) : [];
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load existing session if it exists, otherwise stay unauthenticated
    const saved = localStorage.getItem('moh_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
        localStorage.removeItem('moh_user');
      }
    } else {
      setUser(null);
    }
  }, []);

  const loginAsDemo = (role: UserRole) => {
    console.warn('Demo accounts have been disabled in this environment.');
  };

  const switchRole = (role: UserRole) => {
    console.warn('Role switching is disabled. Please login with proper credentials.');
  };

  const login = async (identifier: string, password?: string): Promise<boolean> => {
    const isNIC = /^[0-9]{9}[vVxX]|[0-9]{12}$/.test(identifier);
    if (!isNIC) {
      throw new Error('Invalid NIC format. Must be 10 digits+V or 12 digits.');
    }

    const users = getRegisteredUsers();
    const matched = users.find(u => u.nic?.toLowerCase() === identifier.toLowerCase() && u.password === password);

    if (!matched) {
      throw new Error('Invalid NIC or password');
    }

    setUser(matched);
    localStorage.setItem('moh_user', JSON.stringify(matched));
    localStorage.setItem('moh_token', 'mock-jwt-token');
    return true;
  };

  const register = async (data: Partial<User> & { password?: string; nic?: string }): Promise<boolean> => {
    const users = getRegisteredUsers();
    
    if (users.find(u => u.nic === data.nic)) {
      throw new Error('NIC is already registered.');
    }

    const newUser: RegisteredUser = {
      id: `user-${Date.now()}`,
      name: data.name || 'Citizen User',
      email: data.email || `${data.nic}@citizen.gov.lk`,
      role: UserRole.CITIZEN,
      phone: data.phone,
      nic: data.nic,
      password: data.password,
      isVerified: true,
    };
    
    users.push(newUser);
    localStorage.setItem('moh_registered_users', JSON.stringify(users));

    setUser(newUser);
    localStorage.setItem('moh_user', JSON.stringify(newUser));
    localStorage.setItem('moh_token', 'mock-jwt-token');
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('moh_user');
    localStorage.removeItem('moh_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginAsDemo,
        switchRole,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
