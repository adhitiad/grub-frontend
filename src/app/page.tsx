// Home Page - Landing/Dashboard
"use client";

import { Button } from "@/components/ui/Button";
import { healthApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
}

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);

  useEffect(() => {
    // Check API health status
    const checkHealth = async () => {
      try {
        console.log("Starting health check...");
        const health = await healthApi.check();
        console.log("Health check successful:", health);
        setHealthStatus(health as any);
      } catch (error) {
        console.error("Health check failed:", error);
        // Set a fallback health status to show the error in UI
        setHealthStatus({
          status: "error",
          timestamp: new Date().toISOString(),
          uptime: 0,
          version: "unknown",
        });
      }
    };

    checkHealth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Authenticated user - show dashboard
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  Grub Distributor
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user.name}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user.role}
                </span>
                <Link href="/auth/logout">
                  <Button variant="outline" size="sm">
                    Logout
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Quick Stats */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          📦
                        </span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Products
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Loading...
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
                        <span className="text-white text-sm font-medium">
                          📋
                        </span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Orders
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Loading...
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
                        <span className="text-white text-sm font-medium">
                          🏪
                        </span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Stores
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Loading...
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
                        <span className="text-white text-sm font-medium">
                          💰
                        </span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Revenue
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Loading...
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/products">
                    <Button className="w-full" variant="outline">
                      Manage Products
                    </Button>
                  </Link>
                  <Link href="/orders">
                    <Button className="w-full" variant="outline">
                      View Orders
                    </Button>
                  </Link>
                  <Link href="/stores">
                    <Button className="w-full" variant="outline">
                      Manage Stores
                    </Button>
                  </Link>
                  <Link href="/analytics">
                    <Button className="w-full" variant="outline">
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* System Status */}
            {healthStatus && (
              <div className="mt-8 bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    System Status
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          healthStatus.status === "healthy"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-700">
                        API Status: {healthStatus.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Uptime: {Math.floor(healthStatus.uptime / 1000)}s
                    </div>
                    <div className="text-sm text-gray-500">
                      Version: {healthStatus.version}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Not authenticated - show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Grub Distributor
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Modern Food</span>
            <span className="block text-blue-600">Distribution System</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your food distribution business with our comprehensive
            management platform. Handle orders, inventory, payments, and
            analytics all in one place.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                      <span className="text-white text-xl">📦</span>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Product Management
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Easily manage your product catalog with categories, pricing,
                    and inventory tracking.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-green-500 rounded-md shadow-lg">
                      <span className="text-white text-xl">📋</span>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Order Processing
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Streamlined order management from placement to delivery with
                    real-time tracking.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-purple-500 rounded-md shadow-lg">
                      <span className="text-white text-xl">📊</span>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Analytics & Reports
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Comprehensive analytics and reporting to help you make
                    data-driven decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        {healthStatus && (
          <div className="mt-16 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    healthStatus.status === "healthy"
                      ? "bg-green-500"
                      : healthStatus.status === "error"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-700">
                  System Status: {healthStatus.status}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {healthStatus.status === "healthy"
                  ? "All systems operational"
                  : healthStatus.status === "error"
                  ? "API connection failed"
                  : "System status unknown"}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
