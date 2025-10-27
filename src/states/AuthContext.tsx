import type {User} from "../types/user.ts";
import {createContext, type JSX, useEffect, useState} from "react";
import {useContext} from "react";
import * as React from "react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isFetching: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: ({children}: { children: React.ReactNode }) => JSX.Element = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  });
  const [isFetching, setIsFetching] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      console.log("aaaa");
      const response = await fetch('http://localhost:8080/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        console.log(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      console.error('Invalid credentials');
      return false;
    }

    const data = await response.json();
    setToken(data.token);
    try {
      localStorage.setItem('token', data.token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error('Could not save token');
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('token');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error('Could not remove token');
    }
  };

  useEffect(() => {
    const getUser = async () => {
      setIsFetching(true);
      await fetchCurrentUser();
      setIsFetching(false);
    }

    if (token) {
        getUser();
    } else {
        setIsFetching(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token && !!user, isFetching }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};