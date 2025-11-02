import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../utils/helpers";
import Icon from "./Icon";

const Header = ({ onMenuToggle, isMobileOpen }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // Mock notifications data - more realistic data
  const mockNotifications = [
    {
      id: 1,
      title: "New Purchase Request",
      message: "John Doe submitted a new purchase request for office supplies",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      type: "approval",
      read: false,
      priority: "high",
    },
    {
      id: 2,
      title: "Bid Submitted",
      message: "TechCorp submitted a bid for your request PR-2024-001",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      type: "bid",
      read: false,
      priority: "medium",
    },
    {
      id: 3,
      title: "Request Approved",
      message: "Your purchase request PR-2024-002 has been approved by Finance",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      type: "status",
      read: true,
      priority: "low",
    },
    {
      id: 4,
      title: "Supplier Update",
      message: "Office Solutions Ltd. updated their contact information",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      type: "supplier",
      read: false,
      priority: "medium",
    },
    {
      id: 5,
      title: "Budget Alert",
      message: "Your department has reached 80% of monthly budget",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      type: "alert",
      read: true,
      priority: "high",
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
      case "supplier":
        return "🏢";
      case "alert":
        return "⚠️";
      default:
        return "🔔";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
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
            {isMobileOpen ? <Icon name="refresh" /> : <Icon name="list" />}
          </button>
          <a href="/" className="logo">
            <span className="logo-icon">
              <Icon name="home" size={18} />
            </span>
            <span>Procurement Pro</span>
          </a>
        </div>

        <div className="user-menu">
          {/* Notification Bell */}
          <div className="notification-container" ref={notificationRef}>
            <button
              className="notification-btn"
              onClick={toggleNotifications}
              aria-label="Notifications"
            >
              <span className="notification-icon">
                <Icon name="bell" size={18} />
              </span>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="notification-backdrop"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Notifications</h4>
                    <div className="d-flex align-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          className="btn btn-link btn-sm"
                          onClick={markAllAsRead}
                          style={{ fontSize: "0.75rem" }}
                        >
                          Mark all as read
                        </button>
                      )}
                      <span className="notification-count">
                        {unreadCount} unread
                      </span>
                    </div>
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
                            <div className="d-flex align-center gap-2">
                              <div className="notification-title">
                                {notification.title}
                              </div>
                              <div
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  backgroundColor: getPriorityColor(
                                    notification.priority
                                  ),
                                }}
                              />
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
                      <div className="notification-empty">
                        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                          🔔
                        </div>
                        No notifications
                      </div>
                    )}
                  </div>

                  <div className="notification-footer">
                    <a href="/notifications" className="btn btn-outline btn-sm">
                      View All Notifications
                    </a>
                  </div>
                </div>
              </>
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
