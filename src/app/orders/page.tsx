// Orders Management Page
"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ordersApi } from "@/lib/api";
import { AuthGuard, useAuth } from "@/lib/auth";
import { debounce, formatCurrency, formatDateTime } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

interface Order {
  id: string;
  userId: string;
  userName?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    priceAtTimeOfOrder: number;
  }>;
  totalAmount: number;
  status:
    | "pending_payment"
    | "processing"
    | "shipped"
    | "completed"
    | "cancelled"
    | "failed";
  paymentDetails?: {
    method: string;
    flipBillId?: string;
    paymentUrl?: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
};

const statusLabels = {
  pending_payment: "Pending Payment",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
  failed: "Failed",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Fetch orders with search and filters
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", searchTerm, statusFilter, currentPage, pageSize],
    queryFn: () =>
      ordersApi.getAll({
        q: searchTerm,
        status: statusFilter,
        page: currentPage,
        limit: pageSize,
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
      notes,
    }: {
      orderId: string;
      status: string;
      notes?: string;
    }) => ordersApi.update(orderId, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      addToast({
        type: "success",
        title: "Success",
        message: "Order status updated successfully",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to update order status",
      });
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      ordersApi.cancel(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      addToast({
        type: "success",
        title: "Success",
        message: "Order cancelled successfully",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to cancel order",
      });
    },
  });

  // Debounced search
  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, 300);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    const notes = prompt("Add notes (optional):");
    updateStatusMutation.mutate({
      orderId,
      status: newStatus,
      notes: notes || undefined,
    });
  };

  const handleCancelOrder = (orderId: string) => {
    const reason = prompt("Cancellation reason (optional):");
    if (window.confirm("Are you sure you want to cancel this order?")) {
      cancelOrderMutation.mutate({ orderId, reason: reason || undefined });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Orders
          </h2>
          <p className="text-gray-600 mb-4">
            {(error as any)?.message || "Something went wrong"}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
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
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage customer orders and track fulfillment
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/orders/new">
                  <Button>Create Order</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Search orders..."
                  onChange={handleSearch}
                  leftIcon="🔍"
                />
                <select
                  className="form-input"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Statuses</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {(ordersData as any)?.length || 0} orders found
                  </span>
                </div>
              </div>
            </div>

            {/* Orders List */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow animate-pulse p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 bg-gray-200 rounded w-32"></div>
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (ordersData as any) && (ordersData as any).length > 0 ? (
              <div className="space-y-4">
                {(ordersData as any).map((order: Order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id.slice(-8)}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[order.status]
                            }`}
                          >
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Items
                          </h4>
                          <div className="space-y-1">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-gray-600">
                                  {item.quantity}x {item.productName}
                                </span>
                                <span className="text-gray-900">
                                  {formatCurrency(
                                    item.priceAtTimeOfOrder * item.quantity
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {order.shippingAddress && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Shipping Address
                            </h4>
                            <div className="text-sm text-gray-600">
                              <p>{order.shippingAddress.street}</p>
                              <p>
                                {order.shippingAddress.city}{" "}
                                {order.shippingAddress.postalCode}
                              </p>
                              <p>{order.shippingAddress.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {order.notes && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            Notes
                          </h4>
                          <p className="text-sm text-gray-600">{order.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          {order.paymentDetails?.paymentUrl &&
                            order.status === "pending_payment" && (
                              <a
                                href={order.paymentDetails.paymentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="outline" size="sm">
                                  Pay Now
                                </Button>
                              </a>
                            )}
                        </div>

                        {/* Status Actions */}
                        {user?.role !== "customer" && (
                          <div className="flex items-center space-x-2">
                            {order.status === "pending_payment" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(order.id, "processing")
                                }
                                disabled={updateStatusMutation.isPending}
                              >
                                Mark Processing
                              </Button>
                            )}
                            {order.status === "processing" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(order.id, "shipped")
                                }
                                disabled={updateStatusMutation.isPending}
                              >
                                Mark Shipped
                              </Button>
                            )}
                            {order.status === "shipped" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(order.id, "completed")
                                }
                                disabled={updateStatusMutation.isPending}
                              >
                                Mark Completed
                              </Button>
                            )}
                            {!["completed", "cancelled", "failed"].includes(
                              order.status
                            ) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={cancelOrderMutation.isPending}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter
                    ? "Try adjusting your search or filters"
                    : "Orders will appear here once customers start placing them"}
                </p>
                <Link href="/orders/new">
                  <Button>Create First Order</Button>
                </Link>
              </div>
            )}

            {/* Pagination */}
            {(ordersData as any) && (ordersData as any).length > 0 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    disabled={(ordersData as any).length < pageSize}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, (ordersData as any).length)}{" "}
                  results
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
