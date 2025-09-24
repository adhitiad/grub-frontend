"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface ReportFilters {
  startDate: string;
  endDate: string;
  format: "json" | "pdf" | "excel";
  groupBy?: "day" | "week" | "month";
  segmentBy?: "value" | "frequency" | "recency";
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<
    "sales" | "customers" | "inventory"
  >("sales");
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    format: "json",
    groupBy: "day",
    segmentBy: "value",
  });

  // Sales Report Query
  const {
    data: salesData,
    isLoading: salesLoading,
    refetch: refetchSales,
  } = useQuery({
    queryKey: ["sales-report", filters],
    queryFn: () => {
      return api.reports.getSales({
        startDate: filters.startDate,
        endDate: filters.endDate,
        groupBy: filters.groupBy || "day",
        format: "json",
      });
    },
    enabled: activeTab === "sales",
  });

  // Customer Analytics Query
  const {
    data: customerData,
    isLoading: customerLoading,
    refetch: refetchCustomers,
  } = useQuery({
    queryKey: ["customer-analytics", filters],
    queryFn: () => {
      return api.reports.getCustomers({
        startDate: filters.startDate,
        endDate: filters.endDate,
        segmentBy: filters.segmentBy || "value",
        format: "json",
      });
    },
    enabled: activeTab === "customers",
  });

  // Inventory Turnover Query
  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    refetch: refetchInventory,
  } = useQuery({
    queryKey: ["inventory-turnover", filters],
    queryFn: () => {
      return api.reports.getInventory({
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: "json",
      });
    },
    enabled: activeTab === "inventory",
  });

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      let endpoint = "";
      let filename = "";

      switch (activeTab) {
        case "sales":
          endpoint = "/reports/sales";
          filename = `sales-report-${filters.startDate}-${filters.endDate}`;
          break;
        case "customers":
          endpoint = "/reports/customers";
          filename = `customer-analytics-${filters.startDate}-${filters.endDate}`;
          break;
        case "inventory":
          endpoint = "/reports/inventory-turnover";
          filename = `inventory-turnover-${filters.startDate}-${filters.endDate}`;
          break;
      }

      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        format,
        ...(activeTab === "sales" && { groupBy: filters.groupBy || "day" }),
        ...(activeTab === "customers" && {
          segmentBy: filters.segmentBy || "value",
        }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.${format === "pdf" ? "pdf" : "xlsx"}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const salesReport = salesData as any;
  const customerAnalytics = customerData as any;
  const inventoryTurnover = inventoryData as any;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reports & Analytics
        </h1>
        <p className="text-gray-600">
          Generate comprehensive business reports and analytics
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Report Filters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>
          {activeTab === "sales" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group By
              </label>
              <select
                value={filters.groupBy}
                onChange={(e) => handleFilterChange("groupBy", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
          )}
          {activeTab === "customers" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segment By
              </label>
              <select
                value={filters.segmentBy}
                onChange={(e) =>
                  handleFilterChange("segmentBy", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="value">Customer Value</option>
                <option value="frequency">Purchase Frequency</option>
                <option value="recency">Purchase Recency</option>
              </select>
            </div>
          )}
          <div className="flex items-end space-x-2">
            <Button
              onClick={() => {
                if (activeTab === "sales") refetchSales();
                else if (activeTab === "customers") refetchCustomers();
                else refetchInventory();
              }}
            >
              Generate Report
            </Button>
            <Button variant="outline" onClick={() => handleExport("excel")}>
              Export Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: "sales", label: "Sales Report" },
            { key: "customers", label: "Customer Analytics" },
            { key: "inventory", label: "Inventory Turnover" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Sales Report Tab */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          {salesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Generating sales report...</p>
            </div>
          ) : salesReport ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Total Revenue
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(salesReport.totalRevenue)}
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Total Orders
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {salesReport.totalOrders.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Average Order Value
                  </h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatCurrency(salesReport.averageOrderValue)}
                  </p>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Top Products
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity Sold
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesReport.topProducts?.map(
                        (product: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product.productName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.quantitySold.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(product.revenue)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No sales data available for the selected period
              </p>
            </div>
          )}
        </div>
      )}

      {/* Customer Analytics Tab */}
      {activeTab === "customers" && (
        <div className="space-y-6">
          {customerLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">
                Generating customer analytics...
              </p>
            </div>
          ) : customerAnalytics ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Total Customers
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {customerAnalytics.totalCustomers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Active Customers
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {customerAnalytics.activeCustomers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Average CLV
                  </h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatCurrency(
                      customerAnalytics.customerLifetimeValue?.average || 0
                    )}
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    New Customers
                  </h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {customerAnalytics.newCustomers.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Top Customers */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Top Customers
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Spent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Order
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customerAnalytics.topCustomers?.map(
                        (customer: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {customer.customerName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {customer.totalOrders}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(customer.totalSpent)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(customer.lastOrderDate)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No customer data available for the selected period
              </p>
            </div>
          )}
        </div>
      )}

      {/* Inventory Turnover Tab */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          {inventoryLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">
                Generating inventory report...
              </p>
            </div>
          ) : inventoryTurnover ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Overall Turnover Rate
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {inventoryTurnover.overallTurnoverRate?.toFixed(2) ||
                      "0.00"}
                    x
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Stock Efficiency
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {Math.round((inventoryTurnover.stockEfficiency || 0) * 100)}
                    %
                  </p>
                </div>
              </div>

              {/* Product Turnover Table */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Product Turnover Analysis
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Turnover Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days in Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventoryTurnover.products?.map(
                        (product: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product.productName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.turnoverRate.toFixed(2)}x
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  product.category === "fast-moving"
                                    ? "bg-green-100 text-green-800"
                                    : product.category === "medium-moving"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : product.category === "slow-moving"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {product.category.replace("-", " ")}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {Math.round(product.daysInStock)} days
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(product.revenueContribution)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No inventory data available for the selected period
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
