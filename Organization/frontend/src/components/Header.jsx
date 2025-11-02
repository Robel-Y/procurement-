import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../utils/helpers";

const Header = ({ onMenuToggle, isMobileOpen }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      title: "New Purchase Request",
      message: "New request from John Doe needs approval",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      type: "approval",
      read: false,
    },
    {
      id: 2,
      title: "Bid Submitted",
      message: "Supplier TechCorp submitted a bid for PR-2024-001",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      type: "bid",
      read: false,
    },
    {
      id: 3,
      title: "Request Approved",
      message: "Your purchase request PR-2024-002 has been approved",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      type: "status",
      read: true,
    },
  ];

  useEffect(() => {
    // Simulate fetching notifications
    setNotifications(mockNotifications);
    const unread = mockNotifications.filter(
      (notification) => !notification.read
    ).length;
    setUnreadCount(unread);
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "approval":
        return "✅";
      case "bid":
        return "💰";
      case "status":
        return "📋";
      default:
        return "🔔";
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="d-flex align-center gap-3">
          <button
            className="mobile-menu-btn"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? "✕" : "☰"}
          </button>
          <a href="/" className="logo">
            <span className="logo-icon">🏢</span>
            <span>Procurement Pro</span>
          </a>
        </div>

        <div className="user-menu">
          {/* Notification Bell */}
          <div className="notification-container">
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <span className="notification-icon">🔔</span>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      className="btn btn-link btn-sm"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${
                          notification.read ? "read" : "unread"
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="notification-icon">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">
                            {notification.title}
                          </div>
                          <div className="notification-message">
                            {notification.message}
                          </div>
                          <div className="notification-time">
                            {formatTime(notification.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="notification-empty">No notifications</div>
                  )}
                </div>

                <div className="notification-footer">
                  <a href="/notifications" className="btn btn-outline btn-sm">
                    View All Notifications
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="user-info">
            <div className="avatar">{getInitials(user?.name || "User")}</div>
            <div className="d-none d-md-flex flex-column">
              <span style={{ fontWeight: "600" }}>{user?.name}</span>
              <span
                style={{
                  color: "var(--text-light)",
                  fontSize: "0.875rem",
                  textTransform: "capitalize",
                }}
              >
                {user?.role} • {user?.department}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="btn btn-outline btn-sm d-none d-md-flex"
          >
            Logout
          </button>
          <button
            onClick={logout}
            className="btn btn-outline btn-sm d-md-none"
            aria-label="Logout"
          >
            🚪
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
