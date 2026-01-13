import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: 'user' | 'owner') => Promise<void>;
  register: (name: string, email: string, password: string, role: 'user' | 'owner', address?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string, role?: 'user' | 'owner') => {
    // Không truyền role, backend sẽ tự động xác định từ database
    const response = await apiService.login(email, password);
    
    // Save token and user to localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify({
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      role: response.user.role
    }));
    
    setUser({
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      role: response.user.role
    });
  };

  const register = async (name: string, email: string, password: string, role: 'user' | 'owner', address?: string) => {
    const response = await apiService.register(name, email, password, role, address);
    
    // Save token and user to localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify({
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      role: response.user.role
    }));
    
    setUser({
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      role: response.user.role
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
