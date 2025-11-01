import { api } from "./api";

export const supplierService = {
  getAll: async (params = {}) => {
    try {
      // Note: I don't see a suppliers route in your provided files
      // You'll need to create this endpoint or adjust accordingly
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/suppliers?${queryString}` : "/suppliers";

      const response = await api.get(endpoint);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch suppliers",
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/suppliers/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch supplier",
      };
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/suppliers", data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to create supplier",
      };
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/suppliers/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update supplier",
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/suppliers/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to delete supplier",
      };
    }
  },
};
