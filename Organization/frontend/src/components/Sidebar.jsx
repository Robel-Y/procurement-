import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { purchaseRequestService } from "../services/purchaseRequests";

const Sidebar = ({ isMobileOpen, onLinkClick }) => {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [myPendingRequests, setMyPendingRequests] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  useEffect(() => {
    fetchSidebarData();
  }, [user]);

  const fetchSidebarData = async () => {
    try {
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

  // Custom SVG Icons
  const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1c.6 0 1-.4 1-1s-.4-1-1-1h-1V4c0-1.1-.9-2-2-2H6C4.9 2 4 2.9 4 4v7H3c-.6 0-1 .4-1 1s.4 1 1 1z" />
    </svg>
  );

  const RequestIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );

  const ApprovalIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );

  const BidIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 3.5C14.8 3.4 14.6 3.4 14.4 3.5L8.4 7C8.1 7.2 8 7.5 8 7.8V12.5C8 12.8 8.1 13.1 8.4 13.2L14.4 16.7C14.6 16.8 14.8 16.8 15 16.7L21 13.2C21.3 13 21.5 12.7 21.5 12.4V10.3C21.5 10 21.3 9.7 21 9.5Z" />
    </svg>
  );

  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );

  const NotificationIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );

  const ReportIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
    </svg>
  );

  const SupplierIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z" />
    </svg>
  );

  const MapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
    </svg>
  );

  const ProfileIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
    </svg>
  );

  const getIcon = (label) => {
    switch (label) {
      case "Dashboard":
        return <DashboardIcon />;
      case "My Requests":
      case "All Requests":
        return <RequestIcon />;
      case "Approvals":
        return <ApprovalIcon />;
      case "Bid Management":
        return <BidIcon />;
      case "User Management":
      case "Register User":
        return <UserIcon />;
      case "Notifications":
        return <NotificationIcon />;
      case "Reports":
        return <ReportIcon />;
      case "Suppliers":
        return <SupplierIcon />;
      case "Supplier Map":
        return <MapIcon />;
      case "Profile":
        return <ProfileIcon />;
      case "Available Bids":
        return <BidIcon />;
      default:
        return <div className="nav-dot"></div>;
    }
  };

  // Base menu item - only Dashboard for all roles
  const baseMenuItems = [{ path: "/", label: "Dashboard" }];

  // Role-based menu items
  const getRoleBasedMenuItems = () => {
    const items = [...baseMenuItems];

    if (user?.role === "requester") {
      items.push({
        path: "/purchase-requests",
        label: "My Requests",
        badge: myPendingRequests,
      });
    }

    if (user?.role === "approver") {
      items.push(
        {
          path: "/approvals",
          label: "Approvals",
          badge: pendingApprovals,
        },
        {
          path: "/notifications",
          label: "Notifications",
          badge: unreadNotifications,
        }
      );
    }

    if (user?.role === "admin") {
      items.push(
        { path: "/purchase-requests", label: "All Requests" },
        {
          path: "/approvals",
          label: "Approvals",
          badge: pendingApprovals,
        },
        { path: "/bid-management", label: "Bid Management" },
        { path: "/users", label: "User Management" },
        { path: "/register-user", label: "Register User" },
        { path: "/suppliers", label: "Suppliers" },
        { path: "/supplier-map", label: "Supplier Map" },
        { path: "/reports", label: "Reports" },
        {
          path: "/notifications",
          label: "Notifications",
          badge: unreadNotifications,
        }
      );
    }

    if (user?.role === "supplier") {
      items.push(
        {
          path: "/supplier-bids",
          label: "Available Bids",
        },
        {
          path: "/notifications",
          label: "Notifications",
          badge: unreadNotifications,
        }
      );
    }

    if (user?.role !== "admin") {
      items.push({ path: "/profile", label: "Profile" });
    }

    return items;
  };

  const menuItems = getRoleBasedMenuItems();

  return (
    <div className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-header">
        <div className="app-logo">
          <div className="logo-icon">PR</div>
          <span className="logo-text">PurchasePro</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={onLinkClick}
              >
                <div className="nav-icon-wrapper">{getIcon(item.label)}</div>
                <span className="nav-label">{item.label}</span>
                {item.badge > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div
            className="user-avatar"
            style={{ background: getRoleGradient(user?.role) }}
          >
            {getInitials(user?.name || "User")}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">
              {capitalizeFirst(user?.role)} • {user?.department}
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

const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getRoleGradient = (role) => {
  switch (role) {
    case "admin":
      return "linear-gradient(135deg, #8B5CF6, #7C3AED)";
    case "approver":
      return "linear-gradient(135deg, #F59E0B, #D97706)";
    case "requester":
      return "linear-gradient(135deg, #3B82F6, #2563EB)";
    case "supplier":
      return "linear-gradient(135deg, #10B981, #059669)";
    default:
      return "linear-gradient(135deg, #6B7280, #4B5563)";
  }
};

export default Sidebar;
