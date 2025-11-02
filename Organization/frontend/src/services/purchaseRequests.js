import { api } from "./api";

export const purchaseRequestService = {
  create: async (data) => {
    try {
      console.log("🔄 Creating purchase request with data:", data);

      // Validate required fields on frontend
      const requiredFields = ["title", "description", "budget", "category"];
      const missingFields = requiredFields.filter((field) => !data[field]);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Ensure budget is a number
      const requestData = {
        ...data,
        budget: Number(data.budget),
        status: "draft", // Ensure initial status
      };

      const response = await api.post("/purchase-requests", requestData);

      console.log("✅ Purchase request created successfully:", response);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("❌ Create purchase request failed:", error);

      return {
        success: false,
        error:
          error.message ||
          "Failed to create purchase request. Please check your connection and try again.",
        details: error,
      };
    }
  },

  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString
        ? `/purchase-requests?${queryString}`
        : "/purchase-requests";

      console.log("🔄 Fetching purchase requests:", endpoint);

      const response = await api.get(endpoint);

      console.log("✅ Purchase requests fetched:", response);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("❌ Fetch purchase requests failed:", error);

      return {
        success: false,
        error: error.message || "Failed to fetch purchase requests",
        details: error,
      };
    }
  },

  // ... keep your other methods the same
  getById: async (id) => {
    try {
      const response = await api.get(`/purchase-requests/${id}`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch purchase request",
      };
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/purchase-requests/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update purchase request",
      };
    }
  },

  submit: async (id) => {
    try {
      const response = await api.put(`/purchase-requests/${id}/submit`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to submit purchase request",
      };
    }
  },

  approve: async (id, data) => {
    try {
      const response = await api.put(`/purchase-requests/${id}/approve`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to approve purchase request",
      };
    }
  },
};
