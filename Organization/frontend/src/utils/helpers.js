// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Get status badge class for CSS styling
export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return "badge-draft";
    case "submitted":
      return "badge-submitted";
    case "approved":
      return "badge-approved";
    case "rejected":
      return "badge-rejected";
    case "pending":
      return "badge-draft";
    default:
      return "badge-draft";
  }
};

// Get status display text
export const getStatusDisplayText = (status) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return "Draft";
    case "submitted":
      return "Submitted";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return status || "Unknown";
  }
};


// Get user initials for avatar
export const getInitials = (name) => {
  if (!name) return "US";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Capitalize first letter
export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  // Simple formatting - you can enhance this
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }
  return phone;
};

// Get urgency color
export const getUrgencyColor = (urgency) => {
  switch (urgency?.toLowerCase()) {
    case "high":
      return "#ef4444"; // red
    case "medium":
      return "#f59e0b"; // amber
    case "low":
      return "#10b981"; // green
    default:
      return "#6b7280"; // gray
  }
};

// Calculate total budget from requests array
export const calculateTotalBudget = (requests) => {
  return requests.reduce((total, request) => total + (request.budget || 0), 0);
};

// Filter requests by status
export const filterRequestsByStatus = (requests, status) => {
  return requests.filter((request) => request.status === status);
};

// Sort requests by date (newest first)
export const sortRequestsByDate = (requests) => {
  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Generate random color for avatars
export const generateRandomColor = () => {
  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#84cc16",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Debounce function for search inputs
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error getting from localStorage:", error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error setting to localStorage:", error);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};

// Error message extractor
export const getErrorMessage = (error) => {
  if (typeof error === "string") return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return "An unexpected error occurred";
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Check if user has permission based on role
export const hasPermission = (user, requiredRole) => {
  if (!user || !user.role) return false;
  const rolesHierarchy = {
    admin: 3,
    approver: 2,
    requester: 1,
  };

  const userLevel = rolesHierarchy[user.role] || 0;
  const requiredLevel = rolesHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
  // Add to src/utils/helpers.js
};

