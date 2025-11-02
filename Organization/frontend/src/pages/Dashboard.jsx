import React from "react";
import { useAuth } from "../context/AuthContext";
import DashboardAdmin from "../components/DashboardAdmin";
import DashboardApprover from "../components/DashboardApprover";
import DashboardRequester from "../components/DashboardRequester";
import Spinner from "../components/Spinner";

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="card text-center p-3">
        <Spinner size="lg" />
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  // Render different dashboard based on user role
  const renderDashboard = () => {
    switch (user?.role) {
      case "admin":
        return <DashboardAdmin />;
      case "approver":
        return <DashboardApprover />;
      case "requester":
        return <DashboardRequester />;
      default:
        return <DashboardRequester />;
    }
  };

  return renderDashboard();
};

export default Dashboard;
