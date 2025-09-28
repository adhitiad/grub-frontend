/* eslint-disable @typescript-eslint/no-explicit-any */
// API Client for Grub Distributor Frontend
import { ApiError, ApiResponse } from "@/types/api";
import axios, { AxiosInstance, AxiosResponse } from "axios";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8520";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY || "asdfghjklqweertyuiopzxcvbnmasdfgtre";
const API_TIMEOUT = 30000; // 30 seconds

// Device ID management
let deviceId: string | null = null;

const generateDeviceId = (): string => {
  if (typeof window !== "undefined") {
    // Try to get existing device ID from localStorage
    const stored = localStorage.getItem("grub_device_id");
    if (stored) return stored;

    // Generate new device ID
    const newDeviceId = `web_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem("grub_device_id", newDeviceId);
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
      "Content-Type": "application/json",
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config: import("axios").InternalAxiosRequestConfig) => {
      // Ensure headers object exists
      config.headers = config.headers ?? {};

      // Add device ID header
      config.headers["X-Device-ID"] = getDeviceId();

      // Add auth token if available
      if (typeof window !== "undefined") {
        const token = API_KEY;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Add correlation ID for request tracking
      config.headers["X-Correlation-ID"] = `web_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

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
        if (typeof window !== "undefined") {
          localStorage.removeItem("grub_auth_token");
          localStorage.removeItem("grub_user");
          window.location.href = "/auth/login";
        }
      }

      // Handle rate limiting
      if (error.response?.status === 429) {
        const resetTime = error.response.headers["x-ratelimit-reset"];
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

// Generic API request wrapper with improved response handling
export const apiRequest = async <T = unknown>(config: any): Promise<T> => {
  try {
    console.log("Making API request:", config.method, config.url);
    const response = await apiClient.request(config);
    console.log("API response received:", response.status, response.data);

    // Handle different response structures
    const responseData = response.data;

    // Check if response has the expected ApiResponse structure
    if (
      responseData &&
      typeof responseData === "object" &&
      "success" in responseData
    ) {
      const apiResponse = responseData as ApiResponse<T>;

      if (!apiResponse.success) {
        const apiError: ApiError = {
          message: apiResponse.message || "API request failed",
          code: apiResponse.error,
          timestamp: new Date().toISOString(),
        };
        throw apiError;
      }

      // Handle successful response with data
      if (apiResponse.data !== undefined) {
        return apiResponse.data as T;
      }

      // Handle successful response without data (e.g., DELETE operations)
      return true as T;
    }

    // Handle direct data responses (not wrapped in ApiResponse structure)
    if (responseData !== null && responseData !== undefined) {
      return responseData as T;
    }

    // Handle empty responses
    return true as T;
  } catch (error: any) {
    console.error("API request error:", error);

    // Handle 503 Service Unavailable (backend is unhealthy but responding)
    if (error.response?.status === 503) {
      console.warn(
        "Backend service is unhealthy but responding. Continuing with degraded functionality."
      );

      const responseData = error.response?.data;

      // Try to extract data from 503 responses if available
      if (responseData) {
        // Check if it's a wrapped response
        if (responseData.success && responseData.data !== undefined) {
          return responseData.data as T;
        }
        // Return direct data if available
        if (responseData !== null && responseData !== undefined) {
          return responseData as T;
        }
      }

      // If no data available in 503 response, throw generic error
      throw new Error("Service temporarily unavailable");
    }

    // Handle malformed responses with better error extraction
    if (error.response?.data) {
      const responseData = error.response.data;

      // Handle different error response structures
      let errorMessage = "API request failed";
      let errorCode: string | undefined;

      if (typeof responseData === "string") {
        errorMessage = responseData;
      } else if (typeof responseData === "object") {
        // Try to extract error message from various possible fields
        errorMessage =
          responseData.message ||
          responseData.error ||
          responseData.errorMessage ||
          responseData.msg ||
          error.message ||
          errorMessage;

        errorCode =
          responseData.code ||
          responseData.errorCode ||
          responseData.statusCode;
      }

      const apiError: ApiError = {
        message: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
      };
      throw apiError;
    }

    // Handle network errors (CORS, connection refused, etc.)
    if (
      error.code === "ERR_NETWORK" ||
      error.code === "NETWORK_ERROR" ||
      error.code === "ECONNABORTED"
    ) {
      throw new Error(
        `Network error: ${error.message}. Please check if the API server is running and CORS is configured.`
      );
    }

    // Handle connection refused
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        `Connection refused: Cannot connect to API server at ${API_BASE_URL}. Please check if the server is running.`
      );
    }

    // Handle timeout
    if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
      throw new Error(`Request timeout: API server took too long to respond.`);
    }

    // Handle cases where error is already an ApiError
    if (error.message && error.timestamp) {
      throw error;
    }

    // Fallback for unknown errors
    const apiError: ApiError = {
      message: error.message || "An unexpected error occurred",
      timestamp: new Date().toISOString(),
    };
    throw apiError;
  }
};

// Authentication API
export const authApi = {
  login: async (email: string, password: string) => {
    return apiRequest({
      method: "POST",
      url: "/api/auth/login",
      data: { email, password },
    });
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
    role: "distributor" | "customer";
    phone?: string;
    address?: string;
  }) => {
    return apiRequest({
      method: "POST",
      url: "/api/auth/register",
      data: { ...userData, deviceId: getDeviceId() },
    });
  },

  logout: async () => {
    return apiRequest({
      method: "POST",
      url: "/api/auth/logout",
    });
  },

  refreshToken: async () => {
    return apiRequest({
      method: "POST",
      url: "/api/auth/refresh",
    });
  },

  getProfile: async () => {
    return apiRequest({
      method: "GET",
      url: "/api/auth/profile",
    });
  },
};

// Products API
interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  search?: string;
  q?: string;
}

export const productsApi = {
  getAll: async (params?: ProductQueryParams) => {
    return apiRequest({
      method: "GET",
      url: "/api/products",
      params,
    });
  },

  getById: async (id: string) => {
    return apiRequest({
      method: "GET",
      url: `/api/products/${id}`,
    });
  },

  create: async (productData: any) => {
    return apiRequest({
      method: "POST",
      url: "/api/products",
      data: productData,
    });
  },

  update: async (id: string, productData: any) => {
    return apiRequest({
      method: "PUT",
      url: `/api/products/${id}`,
      data: productData,
    });
  },

  delete: async (id: string) => {
    return apiRequest({
      method: "DELETE",
      url: `/api/products/${id}`,
    });
  },

  search: async (params: any) => {
    return apiRequest({
      method: "GET",
      url: "/api/products/search",
      params,
    });
  },
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    return apiRequest({
      method: "GET",
      url: "/api/categories",
    });
  },

  getById: async (id: string) => {
    return apiRequest({
      method: "GET",
      url: `/api/categories/${id}`,
    });
  },

  create: async (categoryData: any) => {
    return apiRequest({
      method: "POST",
      url: "/api/categories",
      data: categoryData,
    });
  },

  update: async (id: string, categoryData: any) => {
    return apiRequest({
      method: "PUT",
      url: `/api/categories/${id}`,
      data: categoryData,
    });
  },

  delete: async (id: string) => {
    return apiRequest({
      method: "DELETE",
      url: `/api/categories/${id}`,
    });
  },
};

// Orders API
export const ordersApi = {
  getAll: async (params?: any) => {
    return apiRequest({
      method: "GET",
      url: "/api/orders",
      params,
    });
  },

  getById: async (id: string) => {
    return apiRequest({
      method: "GET",
      url: `/api/orders/${id}`,
    });
  },

  create: async (orderData: any) => {
    return apiRequest({
      method: "POST",
      url: "/api/orders",
      data: orderData,
    });
  },

  update: async (id: string, orderData: any) => {
    return apiRequest({
      method: "PUT",
      url: `/api/orders/${id}`,
      data: orderData,
    });
  },

  cancel: async (id: string) => {
    return apiRequest({
      method: "POST",
      url: `/api/orders/${id}/cancel`,
    });
  },
};

// Stores API
export const storesApi = {
  getAll: async (params?: any) => {
    return apiRequest({
      method: "GET",
      url: "/api/stores",
      params,
    });
  },

  getById: async (id: string) => {
    return apiRequest({
      method: "GET",
      url: `/api/stores/${id}`,
    });
  },

  create: async (storeData: any) => {
    return apiRequest({
      method: "POST",
      url: "/api/stores",
      data: storeData,
    });
  },

  update: async (id: string, storeData: any) => {
    return apiRequest({
      method: "PUT",
      url: `/api/stores/${id}`,
      data: storeData,
    });
  },

  delete: async (id: string) => {
    return apiRequest({
      method: "DELETE",
      url: `/api/stores/${id}`,
    });
  },
};

// Health API
export const healthApi = {
  check: async () => {
    return apiRequest({
      method: "GET",
      url: "/health",
    });
  },

  detailed: async () => {
    return apiRequest({
      method: "GET",
      url: "/health/detailed",
    });
  },
};

// Device API
export const deviceApi = {
  generate: async () => {
    return apiRequest({
      method: "GET",
      url: "/api/device/generate",
    });
  },

  validate: async (deviceId: string) => {
    return apiRequest({
      method: "POST",
      url: "/api/device/validate",
      data: { deviceId },
    });
  },

  info: async () => {
    return apiRequest({
      method: "GET",
      url: "/api/device/info",
    });
  },
};

// Inventory API
export const inventoryApi = {
  getAll: async (params?: any) => {
    return apiRequest({
      method: "GET",
      url: "/api/inventory",
      params,
    });
  },

  getById: async (id: string) => {
    return apiRequest({
      method: "GET",
      url: `/api/inventory/${id}`,
    });
  },

  update: async (id: string, data: any) => {
    return apiRequest({
      method: "PUT",
      url: `/api/inventory/${id}`,
      data,
    });
  },

  getAlerts: async () => {
    return apiRequest({
      method: "GET",
      url: "/api/inventory/alerts",
    });
  },

  getForecast: async (productId: string, days: number = 30) => {
    return apiRequest({
      method: "GET",
      url: `/api/inventory/forecast/${productId}`,
      params: { days },
    });
  },

  acknowledgeAlert: async (alertId: string, notes?: string) => {
    return apiRequest({
      method: "PUT",
      url: `/api/inventory/alerts/${alertId}/acknowledge`,
      data: { notes },
    });
  },

  updateThresholds: async (productId: string, data: any) => {
    return apiRequest({
      method: "PUT",
      url: `/api/inventory/thresholds/${productId}`,
      data,
    });
  },
};

// Reports API
export const reportsApi = {
  getSales: async (params?: any) => {
    return apiRequest({
      method: "GET",
      url: "/api/reports/sales",
      params,
    });
  },

  getInventory: async (params?: any) => {
    return apiRequest({
      method: "GET",
      url: "/api/reports/inventory",
      params,
    });
  },

  getCustomers: async (params?: any) => {
    return apiRequest({
      method: "GET",
      url: "/api/reports/customers",
      params,
    });
  },

  export: async (type: string, format: string, params?: any) => {
    return apiRequest({
      method: "POST",
      url: "/api/reports/export",
      data: { type, format, ...params },
    });
  },
};

// Search API
export const searchApi = {
  products: async (params: any) => {
    return apiRequest({
      method: "GET",
      url: "/api/search/products",
      params,
    });
  },

  suggestions: async (query: string) => {
    return apiRequest({
      method: "GET",
      url: "/api/search/suggestions",
      params: { q: query },
    });
  },

  history: async () => {
    return apiRequest({
      method: "GET",
      url: "/api/search/history",
    });
  },

  saveSearch: async (query: string, filters: any) => {
    return apiRequest({
      method: "POST",
      url: "/api/search/save",
      data: { query, filters },
    });
  },
};

// Images API
export const imagesApi = {
  upload: async (formData: FormData) => {
    return apiRequest({
      method: "POST",
      url: "/api/images/upload",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getAll: async (params?: any) => {
    return apiRequest({
      method: "GET",
      url: "/api/images",
      params,
    });
  },

  getById: async (id: string) => {
    return apiRequest({
      method: "GET",
      url: `/api/images/${id}`,
    });
  },

  delete: async (id: string) => {
    return apiRequest({
      method: "DELETE",
      url: `/api/images/${id}`,
    });
  },
};

// Export device ID utilities
export { generateDeviceId, getDeviceId };

// Main API object for convenience
export const api = {
  auth: authApi,
  products: productsApi,
  categories: categoriesApi,
  orders: ordersApi,
  stores: storesApi,
  health: healthApi,
  device: deviceApi,
  inventory: inventoryApi,
  reports: reportsApi,
  search: searchApi,
  images: imagesApi,
};
