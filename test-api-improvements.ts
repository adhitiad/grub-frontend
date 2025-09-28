/* eslint-disable @typescript-eslint/no-explicit-any */
// Test script to verify API improvements for different response structures
// Note: This is a standalone test file to verify our API improvements

// Mock axios instance to simulate different response scenarios
const mockApiClient = {
  request: async (config: any) => {
    console.log(`Mock API call: ${config.method} ${config.url}`);

    // Simulate different response structures
    const scenarios: Record<string, any> = {
      // Standard ApiResponse structure
      "/api/products": {
        data: {
          success: true,
          message: "Products retrieved successfully",
          data: [
            { id: "1", name: "Product 1", price: 10.99 },
            { id: "2", name: "Product 2", price: 15.99 },
          ],
          timestamp: new Date().toISOString(),
        },
      },

      // Response without data field (DELETE operation)
      "/api/products/1": {
        data: {
          success: true,
          message: "Product deleted successfully",
          timestamp: new Date().toISOString(),
        },
      },

      // Direct data response (not wrapped)
      "/api/health": {
        data: {
          status: "healthy",
          uptime: 12345,
          version: "1.0.0",
        },
      },

      // Error response with different structures
      "/api/products/error": {
        status: 400,
        data: {
          success: false,
          message: "Validation failed",
          error: "INVALID_DATA",
          timestamp: new Date().toISOString(),
        },
      },

      // Malformed error response
      "/api/products/malformed": {
        status: 500,
        data: "Internal server error",
      },

      // Empty response
      "/api/products/empty": {
        data: null,
      },
    };

    const scenario = scenarios[config.url];
    if (scenario) {
      if (scenario.status) {
        const error: any = new Error("API Error");
        error.response = scenario;
        throw error;
      }
      return scenario;
    }

    // Default success response
    return {
      data: {
        success: true,
        data: { message: "Default response" },
        timestamp: new Date().toISOString(),
      },
    };
  },
};

// Import the actual apiRequest function logic for testing
// We'll inline the improved apiRequest function here for testing
async function apiRequest<T = unknown>(config: any): Promise<T> {
  try {
    console.log("Making API request:", config.method, config.url);
    const response = await mockApiClient.request(config);
    console.log("API response received:", response.status, response.data);

    // Handle different response structures
    const responseData = response.data;

    // Check if response has the expected ApiResponse structure
    if (
      responseData &&
      typeof responseData === "object" &&
      "success" in responseData
    ) {
      const apiResponse = responseData as any;

      if (!apiResponse.success) {
        const apiError = {
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

      const apiError = {
        message: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
      };
      throw apiError;
    }

    // Handle cases where error is already an ApiError
    if (error.message && error.timestamp) {
      throw error;
    }

    // Fallback for unknown errors
    const apiError = {
      message: error.message || "An unexpected error occurred",
      timestamp: new Date().toISOString(),
    };
    throw apiError;
  }
}

// Test cases
async function testApiImprovements() {
  console.log(
    "🧪 Testing API Improvements for Different Response Structures\n"
  );

  // Test 1: Standard ApiResponse with data
  console.log("1. Testing standard ApiResponse structure...");
  try {
    const result = await apiRequest({
      method: "GET",
      url: "/api/products",
    });
    console.log("✅ Standard response: SUCCESS");
    console.log(
      "   Data type:",
      Array.isArray(result) ? "Array" : typeof result
    );
    console.log(
      "   Items count:",
      Array.isArray(result) ? result.length : "N/A"
    );
  } catch (error: any) {
    console.log("❌ Standard response: FAILED");
    console.log("   Error:", error.message);
  }

  // Test 2: Response without data field
  console.log("\n2. Testing response without data field...");
  try {
    const result = await apiRequest({
      method: "DELETE",
      url: "/api/products/1",
    });
    console.log("✅ No-data response: SUCCESS");
    console.log("   Result:", result);
  } catch (error: any) {
    console.log("❌ No-data response: FAILED");
    console.log("   Error:", error.message);
  }

  // Test 3: Direct data response
  console.log("\n3. Testing direct data response...");
  try {
    const result = await apiRequest({
      method: "GET",
      url: "/api/health",
    });
    console.log("✅ Direct data response: SUCCESS");
    console.log("   Status:", (result as any).status);
    console.log("   Uptime:", (result as any).uptime);
  } catch (error: any) {
    console.log("❌ Direct data response: FAILED");
    console.log("   Error:", error.message);
  }

  // Test 4: Error response with ApiError structure
  console.log("\n4. Testing error response with ApiError structure...");
  try {
    const result = await apiRequest({
      method: "GET",
      url: "/api/products/error",
    });
    console.log("❌ Error response should have thrown: FAILED", result);
  } catch (error: any) {
    console.log("✅ Error response: SUCCESS");
    console.log("   Error message:", error.message);
    console.log("   Error code:", error.code);
    console.log("   Has timestamp:", !!error.timestamp);
  }

  // Test 5: Malformed error response
  console.log("\n5. Testing malformed error response...");
  try {
    const result = await apiRequest({
      method: "GET",
      url: "/api/products/malformed",
    });
    console.log("❌ Malformed error should have thrown: FAILED", result);
  } catch (error: any) {
    console.log("✅ Malformed error response: SUCCESS");
    console.log("   Error message:", error.message);
    console.log("   Has timestamp:", !!error.timestamp);
  }

  // Test 6: Empty response
  console.log("\n6. Testing empty response...");
  try {
    const result = await apiRequest({
      method: "GET",
      url: "/api/products/empty",
    });
    console.log("✅ Empty response: SUCCESS");
    console.log("   Result:", result);
  } catch (error: any) {
    console.log("❌ Empty response: FAILED");
    console.log("   Error:", error.message);
  }

  console.log("\n🏁 API Improvements Test Complete!");
}

// Run the test
testApiImprovements().catch(console.error);
