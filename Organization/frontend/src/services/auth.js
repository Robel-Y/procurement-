import { api } from "./api";

export const authService = {
  login: async (email, password) => {
    try {
      const data = await api.post("/auth/login", { email, password });
      return {
        success: true,
        data: {
          user: data.data,
          token: data.token,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  },

  register: async (userData) => {
    try {
      const data = await api.post("/auth/register", userData);
      return {
        success: true,
        data: {
          user: data.data,
          token: data.token,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Registration failed",
      };
    }
  },

  getProfile: async () => {
    try {
      const data = await api.get("/auth/me");
      return data.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch profile");
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const data = await api.put("/auth/update-password", passwordData);
      return { success: true, data: data.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update password",
      };
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Logout failed",
      };
    }
  },
};
