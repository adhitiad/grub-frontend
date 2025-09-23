// API Client for Grub Distributor Frontend
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '@/types/api';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8520';
const API_TIMEOUT = 30000; // 30 seconds

// Device ID management
let deviceId: string | null = null;

const generateDeviceId = (): string => {
  if (typeof window !== 'undefined') {
    // Try to get existing device ID from localStorage
    const stored = localStorage.getItem('grub_device_id');
    if (stored) return stored;
    
    // Generate new device ID
    const newDeviceId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('grub_device_id', newDeviceId);
    return newDeviceId;
  }
  
  // Fallback for SSR
  return `ssr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getDeviceId = (): string => {
  if (!deviceId) {
    deviceId = generateDeviceId();
  }
  return deviceId;
};

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config: any) => {
      // Add device ID header
      config.headers['X-Device-ID'] = getDeviceId();
      
      // Add auth token if available
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('grub_auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      
      // Add correlation ID for request tracking
      config.headers['X-Correlation-ID'] = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      return response;
    },
    (error) => {
      // Handle authentication errors
      if (error.response?.status === 401) {
        // Clear auth token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('grub_auth_token');
          localStorage.removeItem('grub_user');
          window.location.href = '/auth/login';
        }
      }
      
      // Handle rate limiting
      if (error.response?.status === 429) {
        const resetTime = error.response.headers['x-ratelimit-reset'];
        if (resetTime) {
          const resetDate = new Date(parseInt(resetTime) * 1000);
          error.message = `Rate limit exceeded. Try again at ${resetDate.toLocaleTimeString()}`;
        }
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

// API client instance
export const apiClient = createApiClient();

// Generic API request wrapper
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient.request<ApiResponse<T>>(config);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'API request failed');
    }
    
    return response.data.data as T;
  } catch (error: any) {
    // Handle axios errors
    if (error.response?.data) {
      const apiError: ApiError = {
        message: error.response.data.message || error.message,
        code: error.response.data.code,
        correlationId: error.response.data.correlationId,
        timestamp: new Date().toISOString(),
      };
      throw apiError;
    }
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      throw new Error('Network error. Please check your connection.');
    }
    
    throw error;
  }
};

// Authentication API
export const authApi = {
  login: async (email: string, password: string) => {
    return apiRequest({
      method: 'POST',
      url: '/api/auth/login',
      data: { email, password, deviceId: getDeviceId() },
    });
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
    role: 'distributor' | 'customer';
    phone?: string;
    address?: string;
  }) => {
    return apiRequest({
      method: 'POST',
      url: '/api/auth/register',
      data: { ...userData, deviceId: getDeviceId() },
    });
  },

  logout: async () => {
    return apiRequest({
      method: 'POST',
      url: '/api/auth/logout',
    });
  },

  refreshToken: async () => {
    return apiRequest({
      method: 'POST',
      url: '/api/auth/refresh',
    });
  },

  getProfile: async () => {
    return apiRequest({
      method: 'GET',
      url: '/api/auth/profile',
    });
  },
};

// Products API
export const productsApi = {
  getAll: async (params?: any) => {
    return apiRequest({
      method: 'GET',
      url: '/api/products',
      params,
    });
  },

  getById: async (id: string) => {
    return apiRequest({
      method: 'GET',
      url: `/api/products/${id}`,
    });
  },

  create: async (productData: any) => {
    return apiRequest({
      method: 'POST',
      url: '/api/products',
      data: productData,
    });
  },

  update: async (id: string, productData: any) => {
    return apiRequest({
      method: 'PUT',
      url: `/api/products/${id}`,
      data: productData,
    });
  },

  delete: async (id: string) => {
    return apiRequest({
      method: 'DELETE',
      url: `/api/products/${id}`,
    });
  },

  search: async (params: any) => {
    return apiRequest({
      method: 'GET',
      url: '/api/products/search',
      params,
    });
  },
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    return apiRequest({
      method: 'GET',
      url: '/api/categories',
    });
  },

  getById: async (id: string) => {
    return apiRequest({
      method: 'GET',
      url: `/api/categories/${id}`,
    });
  },

  create: async (categoryData: any) => {
    return apiRequest({
      method: 'POST',
      url: '/api/categories',
      data: categoryData,
    });
  },

  update: async (id: string, categoryData: any) => {
    return apiRequest({
      method: 'PUT',
      url: `/api/categories/${id}`,
      data: categoryData,
    });
  },

  delete: async (id: string) => {
    return apiRequest({
      method: 'DELETE',
      url: `/api/categories/${id}`,
    });
  },
};

// Orders API
export const ordersApi = {
  getAll: async (params?: any) => {
    return apiRequest({
      method: 'GET',
      url: '/api/orders',
      params,
    });
  },

  getById: async (id: string) => {
    return apiRequest({
      method: 'GET',
      url: `/api/orders/${id}`,
    });
  },

  create: async (orderData: any) => {
    return apiRequest({
      method: 'POST',
      url: '/api/orders',
      data: orderData,
    });
  },

  update: async (id: string, orderData: any) => {
    return apiRequest({
      method: 'PUT',
      url: `/api/orders/${id}`,
      data: orderData,
    });
  },

  cancel: async (id: string) => {
    return apiRequest({
      method: 'POST',
      url: `/api/orders/${id}/cancel`,
    });
  },
};

// Stores API
export const storesApi = {
  getAll: async (params?: any) => {
    return apiRequest({
      method: 'GET',
      url: '/api/stores',
      params,
    });
  },

  getById: async (id: string) => {
    return apiRequest({
      method: 'GET',
      url: `/api/stores/${id}`,
    });
  },

  create: async (storeData: any) => {
    return apiRequest({
      method: 'POST',
      url: '/api/stores',
      data: storeData,
    });
  },

  update: async (id: string, storeData: any) => {
    return apiRequest({
      method: 'PUT',
      url: `/api/stores/${id}`,
      data: storeData,
    });
  },

  delete: async (id: string) => {
    return apiRequest({
      method: 'DELETE',
      url: `/api/stores/${id}`,
    });
  },
};

// Health API
export const healthApi = {
  check: async () => {
    return apiRequest({
      method: 'GET',
      url: '/health',
    });
  },

  detailed: async () => {
    return apiRequest({
      method: 'GET',
      url: '/health/detailed',
    });
  },
};

// Device API
export const deviceApi = {
  generate: async () => {
    return apiRequest({
      method: 'GET',
      url: '/api/device/generate',
    });
  },

  validate: async (deviceId: string) => {
    return apiRequest({
      method: 'POST',
      url: '/api/device/validate',
      data: { deviceId },
    });
  },

  info: async () => {
    return apiRequest({
      method: 'GET',
      url: '/api/device/info',
    });
  },
};

// Export device ID utilities
export { getDeviceId, generateDeviceId };
