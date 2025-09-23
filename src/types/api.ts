// API Types for Grub Distributor Frontend

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  correlationId?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'distributor' | 'customer';
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'distributor' | 'customer';
  phone?: string;
  address?: string;
  deviceId?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category?: Category;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  isActive?: boolean;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

// Store Types
export interface Store {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  ownerId: string;
  owner?: User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreRequest {
  name: string;
  address: string;
  phone?: string;
  email?: string;
}

// Order Types
export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  customer?: User;
  storeId: string;
  store?: Store;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  storeId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  notes?: string;
}

export interface UpdateOrderRequest {
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  notes?: string;
}

// Payment Types
export interface Payment {
  id: string;
  orderId: string;
  order?: Order;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  gatewayResponse?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  method: string;
  amount: number;
}

// Stock Types
export interface Stock {
  id: string;
  productId: string;
  product?: Product;
  storeId: string;
  store?: Store;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  lastUpdated: string;
}

export interface UpdateStockRequest {
  quantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
}

// Search and Filter Types
export interface SearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductSearchParams extends SearchParams {
  storeId?: string;
  inStock?: boolean;
}

export interface OrderSearchParams extends SearchParams {
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  customerId?: string;
  storeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Device and Rate Limiting Types
export interface DeviceInfo {
  deviceId: string;
  platform?: string;
  userAgent?: string;
  ipAddress?: string;
  lastSeen: string;
}

export interface RateLimitInfo {
  deviceId: string;
  requestCount: number;
  resetTime: string;
  isBlocked: boolean;
}

// Health Check Types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services?: {
    database: 'healthy' | 'unhealthy';
    external: 'healthy' | 'unhealthy';
    memory: 'healthy' | 'unhealthy';
  };
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  correlationId?: string;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Form Types
export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Dashboard Types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  topProducts: (Product & { orderCount: number })[];
  revenueChart: {
    date: string;
    revenue: number;
  }[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}
