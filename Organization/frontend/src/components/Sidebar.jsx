import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { purchaseRequestService } from "../services/purchaseRequests";
import Icon from "./Icon";

const Sidebar = ({ isMobileOpen, onLinkClick }) => {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [myPendingRequests, setMyPendingRequests] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(3); // Mock data

  useEffect(() => {
    fetchSidebarData();
  }, [user]);

  const fetchSidebarData = async () => {
    try {
      // Approver/admin pending requests
      if (user?.role === "approver" || user?.role === "admin") {
        const response = await purchaseRequestService.getAll({
          status: "submitted",
        });
        if (response.success) {
          let pendingReqs = response.data.data || [];
          if (user?.role === "approver") {
            pendingReqs = pendingReqs.filter(
              (req) => req.department === user.department
            );
          }
          setPendingApprovals(pendingReqs.length);
        }
      }

      // Requester pending requests
      if (user?.role === "requester") {
        const response = await purchaseRequestService.getAll();
        if (response.success) {
          const myRequests =
            response.data.data?.filter(
              (req) =>
                req.requestedBy?._id === user._id ||
                req.requestedBy === user._id
            ) || [];
          const pending = myRequests.filter(
            (req) => req.status === "submitted" || req.status === "pending"
          ).length;
          setMyPendingRequests(pending);
        }
      }
    } catch (error) {
      console.error("Failed to fetch sidebar data:", error);
    }
  };

  // Base menu item - only Dashboard for all roles
  const baseMenuItems = [{ path: "/", label: "Dashboard", icon: "bar" }];

  // Role-based menu items
  const getRoleBasedMenuItems = () => {
    const items = [...baseMenuItems];

    // Minimal menu for requester
    // In your Sidebar.js, update the getRoleBasedMenuItems function:

    // For requester role:
    if (user?.role === "requester") {
      items.push({
        path: "/purchase-requests",
        label: "My Requests",
        icon: "list",
        badge: myPendingRequests,
      });
    }

    // Minimal menu for approver
    if (user?.role === "approver") {
      items.push(
        {
          path: "/approvals",
          label: "Approvals",
          icon: "check",
          badge: pendingApprovals,
        },
        {
          path: "/notifications",
          label: "Notifications",
          icon: "bell",
          badge: unreadNotifications,
        }
      );
    }

    // Full menu for admin
    if (user?.role === "admin") {
      items.push(
        { path: "/purchase-requests", label: "All Requests", icon: "list" },
        {
          path: "/approvals",
          label: "Approvals",
          icon: "check",
          badge: pendingApprovals,
        },
        { path: "/bid-management", label: "Bid Management", icon: "award" },
        { path: "/users", label: "User Management", icon: "users" },
        { path: "/supplier-map", label: "Supplier Map", icon: "mapPin" },
        { path: "/reports", label: "Reports", icon: "chart" },
        {
          path: "/notifications",
          label: "Notifications",
          icon: "bell",
          badge: unreadNotifications,
        }
      );
    }

    // Minimal menu for supplier
    if (user?.role === "supplier") {
      items.push(
        { path: "/purchase-requests", label: "All Requests", icon: "list" },
        {
          path: "/approvals",
          label: "Approvals",
          icon: "check",
          badge: pendingApprovals,
        },
        { path: "/bid-management", label: "Bid Management", icon: "award" },
        { path: "/users", label: "User Management", icon: "users" },
        { path: "/supplier-map", label: "Supplier Map", icon: "mapPin" },
        { path: "/reports", label: "Reports", icon: "chart" },
        {
          path: "/notifications",
          label: "Notifications",
          icon: "bell",
          badge: unreadNotifications,
        }
      );
    }

    return items;
  };

  const menuItems = getRoleBasedMenuItems();

  return (
    <div className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
      <nav>
        <ul className="sidebar-nav">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={onLinkClick}
              >
                <span className="nav-icon">
                  <Icon name={item.icon} size={18} />
                </span>
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info */}
      <div
        className="p-3 mt-auto border-top"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="d-flex align-center gap-2">
          <div
            className="avatar"
            style={{
              width: 32,
              height: 32,
              fontSize: "0.75rem",
              background: getRoleColor(user?.role),
            }}
          >
            {getInitials(user?.name || "User")}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-light)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.role} • {user?.department}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getInitials = (name) => {
  if (!name) return "US";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getRoleColor = (role) => {
  switch (role) {
    case "admin":
      return "linear-gradient(135deg, #ef4444, #dc2626)";
    case "approver":
      return "linear-gradient(135deg, #f59e0b, #d97706)";
    case "requester":
      return "linear-gradient(135deg, #3b82f6, #2563eb)";
    case "supplier":
      return "linear-gradient(135deg, #10b981, #059669)";
    default:
      return "linear-gradient(135deg, #6b7280, #4b5563)";
  }
};

export default Sidebar;
