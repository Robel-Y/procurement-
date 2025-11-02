import { api } from "./api";

export const purchaseRequestService = {
  create: async (data) => {
    try {
      console.log("Creating purchase request with data:", data);
      const response = await api.post("/purchase-requests", data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to create purchase request",
      };
    }
  },

  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString
        ? `/purchase-requests?${queryString}`
        : "/purchase-requests";

      const response = await api.get(endpoint);
      console.log("API response for purchase requests:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching purchase requests:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch purchase requests",
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/purchase-requests/${id}`);
      return { success: true, data: response.data };
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

  // New method to mark as ordered (after bid selection)
  markAsOrdered: async (id, winningBid) => {
    try {
      const response = await api.put(`/purchase-requests/${id}/order`, {
        winningBid,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to mark as ordered",
      };
    }
  },

  // Get requests ready for bidding (approved but not ordered)
  getBiddingRequests: async () => {
    try {
      const response = await api.get("/purchase-requests?status=approved");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch bidding requests",
      };
    }
  },
};
