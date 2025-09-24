// Dashboard Page with Analytics
'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { AuthGuard } from '@/lib/auth';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalStores: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  recentOrders: Array<{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    userName?: string;
  }>;
  lowStockProducts: Array<{
    id: string;
    productName: string;
    currentStock: number;
    minStock: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch dashboard statistics
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiRequest<DashboardStats>({
      method: 'GET',
      url: '/api/analytics/dashboard',
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user,
  });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{(error as any)?.message || 'Something went wrong'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {user?.name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                            <span className="text-white text-sm font-medium">📦</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Total Products
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {stats.totalProducts.toLocaleString()}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                            <span className="text-white text-sm font-medium">📋</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Total Orders
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {stats.totalOrders.toLocaleString()}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                            <span className="text-white text-sm font-medium">🏪</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Total Stores
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {stats.totalStores.toLocaleString()}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                            <span className="text-white text-sm font-medium">💰</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Total Revenue
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {formatCurrency(stats.totalRevenue)}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Order Status</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Pending Payment</span>
                          <span className="text-sm font-medium text-yellow-600">
                            {stats.pendingOrders}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Completed</span>
                          <span className="text-sm font-medium text-green-600">
                            {stats.completedOrders}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h3>
                      <div className="space-y-2">
                        <Link href="/products/new" className="block">
                          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                            + Add Product
                          </button>
                        </Link>
                        <Link href="/orders/new" className="block">
                          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                            + Create Order
                          </button>
                        </Link>
                        <Link href="/stores/new" className="block">
                          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                            + Add Store
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">System Health</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-sm text-gray-600">API Status: Healthy</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-sm text-gray-600">Database: Connected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders & Low Stock */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Orders */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Recent Orders
                      </h3>
                      {stats.recentOrders && stats.recentOrders.length > 0 ? (
                        <div className="space-y-3">
                          {stats.recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Order #{order.id.slice(-8)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatRelativeTime(order.createdAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  {formatCurrency(order.totalAmount)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.status}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No recent orders</p>
                      )}
                      <div className="mt-4">
                        <Link href="/orders">
                          <button className="text-sm text-blue-600 hover:text-blue-800">
                            View all orders →
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Products */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Low Stock Alert
                      </h3>
                      {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                        <div className="space-y-3">
                          {stats.lowStockProducts.map((product) => (
                            <div key={product.id} className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {product.productName}
                                </p>
                                <p className="text-sm text-red-600">
                                  Only {product.currentStock} left
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Low Stock
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">All products well stocked</p>
                      )}
                      <div className="mt-4">
                        <Link href="/products">
                          <button className="text-sm text-blue-600 hover:text-blue-800">
                            Manage inventory →
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
