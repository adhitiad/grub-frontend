// Test script to verify API improvements for different response structures
const { apiRequest } = require("./src/lib/api.ts");

// Mock axios to simulate different response scenarios
const mockAxios = {
  request: async (config) => {
    console.log(`Mock API call: ${config.method} ${config.url}`);

    // Simulate different response structures
    const scenarios = {
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
        const error = new Error("API Error");
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
  } catch (error) {
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
  } catch (error) {
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
    console.log("   Status:", result.status);
    console.log("   Uptime:", result.uptime);
  } catch (error) {
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
    console.log("❌ Error response should have thrown: FAILED");
  } catch (error) {
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
    console.log("❌ Malformed error should have thrown: FAILED");
  } catch (error) {
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
  } catch (error) {
    console.log("❌ Empty response: FAILED");
    console.log("   Error:", error.message);
  }

  console.log("\n🏁 API Improvements Test Complete!");
}

// Run the test
testApiImprovements().catch(console.error);
