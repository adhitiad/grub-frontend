"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";

interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  minThreshold: number;
  alertType: "low_stock" | "out_of_stock" | "critical";
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged" | "resolved";
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

interface InventoryForecast {
  productId: string;
  productName: string;
  currentStock: number;
  averageDailySales: number;
  daysUntilStockout: number;
  recommendedRestockDate: Date;
  recommendedOrderQuantity: number;
  confidence: number;
}

interface InventoryThreshold {
  productId: string;
  minThreshold: number;
  maxThreshold?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<
    "alerts" | "forecast" | "thresholds"
  >("alerts");
  const [selectedAlert, setSelectedAlert] = useState<InventoryAlert | null>(
    null
  );
  const [thresholdForm, setThresholdForm] = useState<InventoryThreshold>({
    productId: "",
    minThreshold: 0,
    maxThreshold: undefined,
    reorderPoint: undefined,
    reorderQuantity: undefined,
  });

  const queryClient = useQueryClient();

  // Fetch inventory alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ["inventory-alerts"],
    queryFn: () => api.inventory.getAlerts(),
  });

  // Fetch inventory forecast
  const { data: forecastData, isLoading: forecastLoading } = useQuery({
    queryKey: ["inventory-forecast"],
    queryFn: () => api.inventory.getForecast("all"),
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: ({ alertId, notes }: { alertId: string; notes?: string }) =>
      api.inventory.acknowledgeAlert(alertId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-alerts"] });
      setSelectedAlert(null);
    },
  });

  // Update thresholds mutation
  const updateThresholdsMutation = useMutation({
    mutationFn: (data: InventoryThreshold) =>
      api.inventory.updateThresholds(data.productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-alerts"] });
      setThresholdForm({
        productId: "",
        minThreshold: 0,
        maxThreshold: undefined,
        reorderPoint: undefined,
        reorderQuantity: undefined,
      });
    },
  });

  const alerts = (alertsData as any)?.alerts || (alertsData as any) || [];
  const forecasts =
    (forecastData as any)?.forecasts || (forecastData as any) || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleAcknowledgeAlert = (alert: InventoryAlert) => {
    setSelectedAlert(alert);
  };

  const confirmAcknowledge = (notes?: string) => {
    if (selectedAlert) {
      acknowledgeAlertMutation.mutate({
        alertId: selectedAlert.id,
        notes,
      });
    }
  };

  const handleUpdateThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    if (thresholdForm.productId && thresholdForm.minThreshold > 0) {
      updateThresholdsMutation.mutate(thresholdForm);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Inventory Management
        </h1>
        <p className="text-gray-600">
          Monitor stock levels, alerts, and forecasting
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: "alerts", label: "Stock Alerts", count: alerts.length },
            { key: "forecast", label: "Forecasting", count: forecasts.length },
            { key: "thresholds", label: "Thresholds", count: null },
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
              {tab.count !== null && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Stock Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Stock Alerts
              </h2>
              <p className="text-sm text-gray-500">
                Active inventory alerts requiring attention
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {alertsLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading alerts...</p>
                </div>
              ) : alerts.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No active alerts</p>
                </div>
              ) : (
                alerts.map((alert: InventoryAlert) => (
                  <div key={alert.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {alert.productName}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(
                              alert.severity
                            )}`}
                          >
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {alert.alertType.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>
                            Current Stock:{" "}
                            <span className="font-medium">
                              {alert.currentStock}
                            </span>
                          </p>
                          <p>
                            Minimum Threshold:{" "}
                            <span className="font-medium">
                              {alert.minThreshold}
                            </span>
                          </p>
                          <p>
                            Created:{" "}
                            <span className="font-medium">
                              {formatDate(alert.createdAt)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {alert.status === "active" && (
                          <Button
                            onClick={() => handleAcknowledgeAlert(alert)}
                            variant="outline"
                            size="sm"
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Forecasting Tab */}
      {activeTab === "forecast" && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Inventory Forecasting
              </h2>
              <p className="text-sm text-gray-500">
                Predictive analytics for stock management
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Daily Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Until Stockout
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restock Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recommended Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forecastLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">
                          Loading forecasts...
                        </p>
                      </td>
                    </tr>
                  ) : forecasts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No forecast data available
                      </td>
                    </tr>
                  ) : (
                    forecasts.map((forecast: InventoryForecast) => (
                      <tr
                        key={forecast.productId}
                        className={
                          forecast.daysUntilStockout <= 7 ? "bg-red-50" : ""
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {forecast.productName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {forecast.currentStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {forecast.averageDailySales.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={
                              forecast.daysUntilStockout <= 7
                                ? "text-red-600 font-medium"
                                : ""
                            }
                          >
                            {forecast.daysUntilStockout} days
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(forecast.recommendedRestockDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {forecast.recommendedOrderQuantity} units
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${forecast.confidence * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs">
                              {Math.round(forecast.confidence * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Thresholds Tab */}
      {activeTab === "thresholds" && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Inventory Thresholds
              </h2>
              <p className="text-sm text-gray-500">
                Configure stock alert thresholds for products
              </p>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateThresholds} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product ID
                    </label>
                    <Input
                      type="text"
                      value={thresholdForm.productId}
                      onChange={(e) =>
                        setThresholdForm({
                          ...thresholdForm,
                          productId: e.target.value,
                        })
                      }
                      placeholder="Enter product ID"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Threshold *
                    </label>
                    <Input
                      type="number"
                      value={thresholdForm.minThreshold}
                      onChange={(e) =>
                        setThresholdForm({
                          ...thresholdForm,
                          minThreshold: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Minimum stock level"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Threshold
                    </label>
                    <Input
                      type="number"
                      value={thresholdForm.maxThreshold || ""}
                      onChange={(e) =>
                        setThresholdForm({
                          ...thresholdForm,
                          maxThreshold: parseInt(e.target.value) || undefined,
                        })
                      }
                      placeholder="Maximum stock level"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Point
                    </label>
                    <Input
                      type="number"
                      value={thresholdForm.reorderPoint || ""}
                      onChange={(e) =>
                        setThresholdForm({
                          ...thresholdForm,
                          reorderPoint: parseInt(e.target.value) || undefined,
                        })
                      }
                      placeholder="Reorder trigger point"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Quantity
                  </label>
                  <Input
                    type="number"
                    value={thresholdForm.reorderQuantity || ""}
                    onChange={(e) =>
                      setThresholdForm({
                        ...thresholdForm,
                        reorderQuantity: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="Recommended reorder quantity"
                    min="1"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateThresholdsMutation.isPending}
                  >
                    {updateThresholdsMutation.isPending
                      ? "Updating..."
                      : "Update Thresholds"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Acknowledge Alert Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Acknowledge Alert
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Acknowledge the stock alert for{" "}
                <strong>{selectedAlert.productName}</strong>?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add any notes about this acknowledgment..."
                  id="acknowledge-notes"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAlert(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const notes = (
                      document.getElementById(
                        "acknowledge-notes"
                      ) as HTMLTextAreaElement
                    )?.value;
                    confirmAcknowledge(notes);
                  }}
                  disabled={acknowledgeAlertMutation.isPending}
                >
                  {acknowledgeAlertMutation.isPending
                    ? "Acknowledging..."
                    : "Acknowledge"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
