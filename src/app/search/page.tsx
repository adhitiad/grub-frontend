"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { debounce, formatCurrency } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

interface SearchFilters {
  query?: string;
  category?: string;
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  availability?: "in_stock" | "low_stock" | "out_of_stock" | "all";
  stores?: string[];
  sortBy?:
    | "relevance"
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "name_desc"
    | "newest"
    | "popularity"
    | "rating";
}

interface SearchResult {
  products: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    category: {
      id: string;
      name: string;
    };
    imageUrl?: string;
    isActive: boolean;
    stock: number;
    rating?: number;
    reviewCount?: number;
    store?: {
      id: string;
      name: string;
      distance?: number;
    };
  }>;
  facets: {
    categories: Array<{
      id: string;
      name: string;
      count: number;
    }>;
    priceRanges: Array<{
      min: number;
      max: number;
      count: number;
      label: string;
    }>;
    availability: Array<{
      status: string;
      count: number;
      label: string;
    }>;
  };
  suggestions: string[];
  totalCount: number;
  searchTime: number;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get("q") || "",
    categories: searchParams.getAll("categories"),
    priceMin: searchParams.get("priceMin")
      ? parseFloat(searchParams.get("priceMin")!)
      : undefined,
    priceMax: searchParams.get("priceMax")
      ? parseFloat(searchParams.get("priceMax")!)
      : undefined,
    availability: (searchParams.get("availability") as any) || "all",
    sortBy: (searchParams.get("sortBy") as any) || "relevance",
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [savedSearchName, setSavedSearchName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Search products query
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = useQuery({
    queryKey: ["search-products", filters, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.query) params.set("q", filters.query);
      if (filters.categories?.length)
        filters.categories.forEach((cat) => params.append("categories", cat));
      if (filters.priceMin !== undefined)
        params.set("priceMin", filters.priceMin.toString());
      if (filters.priceMax !== undefined)
        params.set("priceMax", filters.priceMax.toString());
      const searchParams = {
        query: filters.query,
        category: filters.category !== "all" ? filters.category : undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        location: filters.location || undefined,
        availability:
          filters.availability !== "all" ? filters.availability : undefined,
        sortBy: filters.sortBy || undefined,
        page: page,
        limit: 20,
      };

      return api.search.products(searchParams);
    },
    enabled: true,
  });

  // Get search suggestions
  const getSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length >= 2) {
        try {
          const response = await api.search.suggestions(query);
          setSuggestions(response.suggestions || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Failed to get suggestions:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    []
  );

  // Save search mutation
  const saveSearchMutation = useMutation({
    mutationFn: (data: { name: string; filters: SearchFilters }) =>
      api.search.saveSearch(data.name, data.filters),
    onSuccess: () => {
      setShowSaveModal(false);
      setSavedSearchName("");
      // Show success message
    },
  });

  // Get saved searches
  const { data: savedSearchesData } = useQuery({
    queryKey: ["saved-searches"],
    queryFn: () => api.search.history(),
  });

  const searchResult: SearchResult = (searchData as any) || {
    products: [],
    facets: { categories: [], priceRanges: [], availability: [] },
    suggestions: [],
    totalCount: 0,
    searchTime: 0,
  };

  const savedSearches = savedSearchesData?.data?.savedSearches || [];

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.categories?.length)
      filters.categories.forEach((cat) => params.append("categories", cat));
    if (filters.priceMin !== undefined)
      params.set("priceMin", filters.priceMin.toString());
    if (filters.priceMax !== undefined)
      params.set("priceMax", filters.priceMax.toString());
    if (filters.availability && filters.availability !== "all")
      params.set("availability", filters.availability);
    if (filters.sortBy && filters.sortBy !== "relevance")
      params.set("sortBy", filters.sortBy);

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Get suggestions when query changes
  useEffect(() => {
    if (filters.query) {
      getSuggestions(filters.query);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [filters.query, getSuggestions]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];

    handleFilterChange("categories", newCategories);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleFilterChange("query", suggestion);
    setShowSuggestions(false);
  };

  const handleSaveSearch = () => {
    if (savedSearchName.trim()) {
      saveSearchMutation.mutate({
        name: savedSearchName.trim(),
        filters,
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      categories: [],
      priceMin: undefined,
      priceMax: undefined,
      availability: "all",
      sortBy: "relevance",
    });
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Product Search
        </h1>
        <p className="text-gray-600">
          Find products with advanced filtering and search
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>

            {/* Categories Filter */}
            {searchResult.facets.categories.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Categories
                </h3>
                <div className="space-y-2">
                  {searchResult.facets.categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          filters.categories?.includes(category.id) || false
                        }
                        onChange={() => handleCategoryToggle(category.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {category.name} ({category.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Price Range
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "priceMin",
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "priceMax",
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                />
              </div>
              {searchResult.facets.priceRanges.length > 0 && (
                <div className="mt-3 space-y-1">
                  {searchResult.facets.priceRanges.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleFilterChange("priceMin", range.min);
                        handleFilterChange(
                          "priceMax",
                          range.max === Infinity ? undefined : range.max
                        );
                      }}
                      className="block w-full text-left text-sm text-blue-600 hover:text-blue-800"
                    >
                      {range.label} ({range.count})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Availability Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Availability
              </h3>
              <div className="space-y-2">
                {searchResult.facets.availability.map((avail) => (
                  <label key={avail.status} className="flex items-center">
                    <input
                      type="radio"
                      name="availability"
                      value={avail.status}
                      checked={filters.availability === avail.status}
                      onChange={(e) =>
                        handleFilterChange("availability", e.target.value)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {avail.label} ({avail.count})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Saved Searches
                </h3>
                <div className="space-y-1">
                  {savedSearches.slice(0, 5).map((search: any) => (
                    <button
                      key={search.id}
                      onClick={() => setFilters(search.filters)}
                      className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 truncate"
                    >
                      {search.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3">
          {/* Search Bar */}
          <div className="mb-6 relative">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={filters.query || ""}
                  onChange={(e) => handleFilterChange("query", e.target.value)}
                  className="w-full"
                />
                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={() => setShowSaveModal(true)} variant="outline">
                Save Search
              </Button>
            </div>
          </div>

          {/* Sort and Results Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              {searchResult.totalCount > 0 ? (
                <>
                  Showing {searchResult.products.length} of{" "}
                  {searchResult.totalCount} results
                  {searchResult.searchTime > 0 && (
                    <span className="ml-2">({searchResult.searchTime}ms)</span>
                  )}
                </>
              ) : (
                "No results found"
              )}
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={filters.sortBy || "relevance"}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="newest">Newest</option>
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Search Results Grid */}
          {searchLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Searching products...</p>
            </div>
          ) : searchError ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading search results</p>
            </div>
          ) : searchResult.products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No products found matching your criteria
              </p>
              {searchResult.suggestions.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Did you mean:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {searchResult.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {searchResult.products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(product.price)}
                      </span>
                      {product.rating && (
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating} ({product.reviewCount || 0})
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Stock: {product.stock}</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {product.category.name}
                      </span>
                    </div>
                    {product.store && (
                      <div className="mt-2 text-xs text-gray-500">
                        {product.store.name}
                        {product.store.distance && (
                          <span className="ml-2">
                            ({product.store.distance.toFixed(1)} km)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {searchResult.totalCount > 20 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {Math.ceil(searchResult.totalCount / 20)}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= Math.ceil(searchResult.totalCount / 20)}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Save Search
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Name
                </label>
                <Input
                  type="text"
                  value={savedSearchName}
                  onChange={(e) => setSavedSearchName(e.target.value)}
                  placeholder="Enter a name for this search"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveModal(false);
                    setSavedSearchName("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSearch}
                  disabled={
                    !savedSearchName.trim() || saveSearchMutation.isPending
                  }
                >
                  {saveSearchMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
