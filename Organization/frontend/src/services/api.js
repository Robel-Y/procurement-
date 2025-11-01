// Base API configuration
const API_BASE_URL = "http://localhost:5000/api";

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  // Check if user is online
  if (!navigator.onLine) {
    throw new Error("You are offline. Please check your internet connection.");
  }

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error("Invalid response from server");
    }

    // Handle unauthorized responses
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Unauthorized - Please login again");
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);

    // Re-throw with better error message
    if (error.message.includes("Failed to fetch")) {
      throw new Error(
        "Cannot connect to server. Please make sure the backend is running on http://localhost:5000"
      );
    }

    throw error;
  }
};

// API methods
export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: "GET" }),

  post: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "POST",
      body: data,
    }),

  put: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: data,
    }),

  delete: (endpoint) =>
    apiRequest(endpoint, {
      method: "DELETE",
    }),
};

export default api;
