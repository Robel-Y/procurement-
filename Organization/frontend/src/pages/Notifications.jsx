import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // all, unread, read

  // Mock notifications data - same as header but more comprehensive
  const mockNotifications = [
    {
      id: 1,
      title: "New Purchase Request",
      message:
        "John Doe submitted a new purchase request for office supplies worth $2,500",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: "approval",
      read: false,
      priority: "high",
      actionRequired: true,
    },
    {
      id: 2,
      title: "Bid Submitted",
      message:
        "TechCorp submitted a bid for your request PR-2024-001 - Amount: $12,000",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: "bid",
      read: false,
      priority: "medium",
      actionRequired: true,
    },
    {
      id: 3,
      title: "Request Approved",
      message:
        "Your purchase request PR-2024-002 has been approved by Finance Department",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: "status",
      read: true,
      priority: "low",
      actionRequired: false,
    },
    {
      id: 4,
      title: "Supplier Update",
      message:
        "Office Solutions Ltd. updated their contact information and product catalog",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      type: "supplier",
      read: false,
      priority: "medium",
      actionRequired: false,
    },
    {
      id: 5,
      title: "Budget Alert",
      message:
        "Your department has reached 80% of the monthly allocated budget",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      type: "alert",
      read: true,
      priority: "high",
      actionRequired: true,
    },
    {
      id: 6,
      title: "Contract Expiring",
      message: "Contract with Industrial Parts Co. expires in 30 days",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      type: "reminder",
      read: false,
      priority: "medium",
      actionRequired: true,
    },
  ];

  useEffect(() => {
    // Simulate API call
    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
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
      case "reminder":
        return "⏰";
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

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fade-in">
      <div className="card-header mb-3">
        <div className="d-flex justify-between align-center">
          <div>
            <h1 className="card-title mb-1">Notifications</h1>
            <p style={{ color: "var(--text-light)" }}>
              Manage your notifications and stay updated
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn btn-outline btn-sm">
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card mb-3">
        <div className="p-3">
          <div className="d-flex gap-2">
            <button
              className={`btn btn-sm ${
                filter === "all" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </button>
            <button
              className={`btn btn-sm ${
                filter === "unread" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`btn btn-sm ${
                filter === "read" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setFilter("read")}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card">
        {filteredNotifications.length > 0 ? (
          <div className="notification-list-full">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item-full ${
                  notification.read ? "read" : "unread"
                } ${notification.actionRequired ? "action-required" : ""}`}
              >
                <div className="notification-main">
                  <div className="notification-icon-large">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content-full">
                    <div className="d-flex justify-between align-start">
                      <div>
                        <h4 className="notification-title-full">
                          {notification.title}
                          {!notification.read && (
                            <span className="unread-indicator">•</span>
                          )}
                        </h4>
                        <p className="notification-message-full">
                          {notification.message}
                        </p>
                        <div className="notification-meta">
                          <span className="notification-time-full">
                            {formatTime(notification.timestamp)}
                          </span>
                          <span
                            className="priority-badge"
                            style={{
                              backgroundColor: getPriorityColor(
                                notification.priority
                              ),
                            }}
                          >
                            {notification.priority}
                          </span>
                          {notification.actionRequired && (
                            <span className="action-badge">
                              Action Required
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="notification-actions">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="btn btn-link btn-sm"
                            title="Mark as read"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="btn btn-link btn-sm text-danger"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6">
            <div className="empty-state">
              <div className="empty-state-icon" style={{ fontSize: "4rem" }}>
                🔔
              </div>
              <h3>No notifications</h3>
              <p>You're all caught up! New notifications will appear here.</p>
              <button
                onClick={() => setFilter("all")}
                className="btn btn-primary"
              >
                View All Notifications
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
