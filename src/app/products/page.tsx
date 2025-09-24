// Products Management Page
"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { productsApi } from "@/lib/api";
import { AuthGuard, useAuth } from "@/lib/auth";
import { debounce, formatCurrency } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  purchasePrice?: number;
  category: {
    id: string;
    name: string;
  };
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Fetch products with search and filters
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", searchTerm, selectedCategory, currentPage, pageSize],
    queryFn: () =>
      productsApi.getAll({
        q: searchTerm,
        category: selectedCategory,
        page: currentPage,
        limit: pageSize,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productsApi.getAll(), // This should be categoriesApi.getAll()
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => productsApi.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      addToast({
        type: "success",
        title: "Success",
        message: "Product deleted successfully",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to delete product",
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

  const handleDeleteProduct = async (
    productId: string,
    productName: string
  ) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      deleteProductMutation.mutate(productId);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Products
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
    <AuthGuard requireAuth={true} requiredRole="distributor">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your product catalog
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/products/new">
                  <Button>Add Product</Button>
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
                  placeholder="Search products..."
                  onChange={handleSearch}
                  leftIcon="🔍"
                />
                <select
                  className="form-input"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Categories</option>
                  {(categories as any)?.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {(productsData as any)?.length || 0} products found
                  </span>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow animate-pulse"
                  >
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (productsData as any) && (productsData as any).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(productsData as any).map((product: Product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <span className="text-4xl">📦</span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {product.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(product.price)}
                          </p>
                          {product.purchasePrice && (
                            <p className="text-sm text-gray-500">
                              Cost: {formatCurrency(product.purchasePrice)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <Link href={`/products/${product.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                          <Link href={`/products/${product.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteProduct(product.id, product.name)
                            }
                            disabled={deleteProductMutation.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first product"}
                </p>
                <Link href="/products/new">
                  <Button>Add Your First Product</Button>
                </Link>
              </div>
            )}

            {/* Pagination */}
            {(productsData as any) && (productsData as any).length > 0 && (
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
                    disabled={(productsData as any).length < pageSize}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(
                    currentPage * pageSize,
                    (productsData as any).length
                  )}{" "}
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
