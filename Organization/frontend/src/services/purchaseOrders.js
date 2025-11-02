// src/services/purchaseOrders.js
import api from "./api";

export const purchaseOrderService = {
  async getOrders() {
    try {
      const response = await api.get("/purchase-orders");
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      throw error;
    }
  },

  async getOrder(id) {
    try {
      const response = await api.get(`/purchase-orders/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order:", error);
      throw error;
    }
  },

  async createOrder(orderData) {
    try {
      const response = await api.post("/purchase-orders", orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating purchase order:", error);
      throw error;
    }
  },

  async updateOrderStatus(id, status) {
    try {
      const response = await api.put(`/purchase-orders/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },
};
