// api.js
const API_BASE_URL = "http://localhost:5000/api";

// Enhanced API request function
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

  // Handle request body
  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  console.log(`🔄 API Call: ${config.method} ${url}`, config.body);

  try {
    const response = await fetch(url, config);

    console.log(
      `📨 Response Status: ${response.status} ${response.statusText}`
    );

    // Handle unauthorized responses
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    let data;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
    }

    console.log(`📨 Response Data:`, data);

    if (!response.ok) {
      throw new Error(
        data.message || data.error || `HTTP error! status: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("❌ API request failed:", error);

    // Enhanced error messages
    if (error.message.includes("Failed to fetch")) {
      throw new Error(
        "Cannot connect to server. Please check:\n1. Backend is running on http://localhost:5000\n2. No CORS issues\n3. Network connectivity"
      );
    }

    if (error.message.includes("Unexpected token")) {
      throw new Error(
        "Server returned invalid response. Check backend is running properly."
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
