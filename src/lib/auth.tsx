/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Authentication utilities and context
"use client";

import { authApi } from "@/lib/api";
import { User } from "@/types/api";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: "distributor" | "customer";
  phone?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth storage utilities
const AUTH_TOKEN_KEY = "123456";
const USER_DATA_KEY = "grub_user";

const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

const setAuthData = (token: string, user: User): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

const clearAuthData = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getStoredToken();
        const storedUser = getStoredUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);

          // Verify token is still valid
          try {
            const profile = await authApi.getProfile();
            setUser(profile as User);
          } catch (error: any) {
            // Token is invalid, clear auth data
            clearAuthData();
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response: any = await authApi.login(email, password);

      setToken(response.token);
      setUser(response.user);
      setAuthData(response.token, response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const response: any = await authApi.register(userData);

      setToken(response.token);
      setUser(response.user);
      setAuthData(response.token, response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API error:", error);
    } finally {
      setToken(null);
      setUser(null);
      clearAuthData();
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      const profile: any = await authApi.getProfile();
      setUser(profile);

      if (typeof window !== "undefined") {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(profile));
      }
    } catch (error) {
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Auth Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth Guard Component
interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: User["role"];
  fallback?: ReactNode;
}

export const AuthGuard = ({
  children,
  requireAuth = true,
  requiredRole,
  fallback,
}: AuthGuardProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please log in to access this page.
            </p>
            <a
              href="/auth/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Go to Login
            </a>
          </div>
        </div>
      )
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Required role: {requiredRole}, Your role: {user?.role}
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};

// Role-based access control utilities
export const hasRole = (user: User | null, role: User["role"]): boolean => {
  return user?.role === role;
};

export const hasAnyRole = (
  user: User | null,
  roles: User["role"][]
): boolean => {
  return user ? roles.includes(user.role) : false;
};

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, "admin");
};

export const isDistributor = (user: User | null): boolean => {
  return hasRole(user, "distributor");
};

export const isCustomer = (user: User | null): boolean => {
  return hasRole(user, "customer");
};

// Permission utilities
export const canManageProducts = (user: User | null): boolean => {
  return hasAnyRole(user, ["admin", "distributor"]);
};

export const canManageOrders = (user: User | null): boolean => {
  return hasAnyRole(user, ["admin", "distributor"]);
};

export const canManageStores = (user: User | null): boolean => {
  return hasAnyRole(user, ["admin", "distributor"]);
};

export const canViewAnalytics = (user: User | null): boolean => {
  return hasAnyRole(user, ["admin", "distributor"]);
};

export const canManageUsers = (user: User | null): boolean => {
  return hasRole(user, "admin");
};
