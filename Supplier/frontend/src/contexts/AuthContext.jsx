import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      console.log('Auth useEffect token:', token);
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const getCurrentUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to get current user:', error);
      if (error.response?.status === 401) {
        // Token invalid — clear silently
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { data } = response.data;

      if (data && data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data);
        return { success: true, data };
      } else {
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Login failed. Please check your credentials.',
        error: error.response?.data,
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { data } = response.data;

      if (data && data.token) {
        setToken(data.token);
        setUser(data);
        localStorage.setItem('token', data.token);
        return { success: true, data };
      } else {
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Registration failed. Please try again.',
        error: error.response?.data,
      };
    }
  };

  const logout = () => {
    console.log('Logging out user...');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data.data);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed',
      };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Password change failed',
      };
    }
  };

  // Role-based access helpers
  const isAdmin = user?.role === 'admin';
  const isSupplier = user?.supplierId !== null && user?.supplierId !== undefined;
  const canCreateRFQ = isAdmin;
  const canViewAllBids = isAdmin;
  const canManageSuppliers = isAdmin;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAdmin,
    isSupplier,
    canCreateRFQ,
    canViewAllBids,
    canManageSuppliers,
    userRole: user?.role,
    supplierId: user?.supplierId,
    token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
