import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        // Try to parse saved user data
        const userData = JSON.parse(savedUser);
        setUser(userData);

        // If online, try to refresh user data from server
        if (isOnline) {
          console.log("🔄 Online - refreshing user data from server");
          try {
            const freshUserData = await authService.getProfile();
            setUser(freshUserData);
            localStorage.setItem("user", JSON.stringify(freshUserData));
            console.log("✅ User data refreshed from server");
          } catch (error) {
            console.warn(
              "⚠️ Could not refresh user data, using cached data:",
              error.message
            );
            // Continue with cached data if server is unavailable
          }
        } else {
          console.log("📴 Offline - using cached user data");
        }
      } catch (error) {
        console.error("❌ Error parsing saved user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    // If offline, we can't login
    if (!isOnline) {
      return {
        success: false,
        error:
          "Cannot login while offline. Please check your internet connection.",
      };
    }

    try {
      const response = await authService.login(email, password);
      if (response.success) {
        setUser(response.data.user);
        // Save both token and user data to localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed. Please try again.",
      };
    }
  };

  const logout = async () => {
    try {
      // Only try server logout if online
      if (isOnline) {
        await authService.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    // Also update localStorage
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Function to check if user can perform actions while offline
  const canPerformAction = (action) => {
    if (isOnline) return true;

    // Define what actions are allowed offline
    const offlineAllowedActions = [
      "view_requests",
      "view_profile",
      "view_dashboard",
    ];

    return offlineAllowedActions.includes(action);
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    isOnline,
    canPerformAction,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
