import { api } from "./api";

export const bidService = {
  // Get bids for a purchase request
  getBidsByRequest: async (purchaseRequestId) => {
    try {
      const response = await api.get(`/bids/request/${purchaseRequestId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch bids",
      };
    }
  },

  // Submit a bid (for suppliers)
  submitBid: async (bidData) => {
    try {
      const response = await api.post("/bids", bidData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to submit bid",
      };
    }
  },

  // Get top 5 bids (algorithm)
  getTopBids: async (purchaseRequestId) => {
    try {
      const response = await api.get(`/bids/request/${purchaseRequestId}/top`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch top bids",
      };
    }
  },

  // Select winning bid (admin)
  selectWinningBid: async (bidId, purchaseRequestId) => {
    try {
      const response = await api.put(`/bids/${bidId}/select`, {
        purchaseRequestId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to select winning bid",
      };
    }
  },

  // Get all bids for admin
  getAllBids: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/bids?${queryString}` : "/bids";

      const response = await api.get(endpoint);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch bids",
      };
    }
  },
};
