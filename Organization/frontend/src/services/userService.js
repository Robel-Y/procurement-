import { api } from "./api";

export const userService = {
  getProfile: async () => {
    try {
      // Using your user routes structure
      const response = await api.get("/users/profile/me");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch profile",
      };
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.put("/users/profile/me", data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update profile",
      };
    }
  },

  changePassword: async (data) => {
    try {
      const response = await api.put("/auth/update-password", data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to change password",
      };
    }
  },

  getUsers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/users?${queryString}` : "/users";

      const response = await api.get(endpoint);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch users",
      };
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update user",
      };
    }
  },
};
