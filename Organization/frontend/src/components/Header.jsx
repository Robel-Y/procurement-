import React from "react";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../utils/helpers";

const Header = ({ onMenuToggle, isMobileOpen }) => {
  const { user, logout } = useAuth();

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
