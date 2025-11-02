import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PurchaseRequests from "./pages/PurchaseRequests";
import CreatePurchaseRequest from "./pages/CreatePurchaseRequest";
import UserRegistration from "./pages/UserRegistration";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Suppliers from "./pages/Suppliers";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import PurchaseRequestDetails from "./pages/PurchaseRequestDetails";
import Approvals from "./pages/Approvals";
import "./styles.css";
import NotFound from "./pages/NotFound";
import BidManagement from "./pages/BidManagement";
import SupplierBids from "./pages/SupplierBids";
import SupplierMapPage from "./pages/SupplierMapPage"; // Add this import
import Notifications from "./pages/Notifications";

const Layout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleLinkClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="app">
      <Header onMenuToggle={handleMenuToggle} isMobileOpen={isMobileOpen} />
      <div className="app-body">
        <Sidebar isMobileOpen={isMobileOpen} onLinkClick={handleLinkClick} />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-requests"
            element={
              <ProtectedRoute>
                <Layout>
                  <PurchaseRequests />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-requests/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <PurchaseRequestDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-purchase-request"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreatePurchaseRequest />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals"
            element={
              <ProtectedRoute>
                <Layout>
                  <Approvals />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suppliers />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Add Supplier Map Route - Place it here */}
          <Route
            path="/supplier-map"
            element={
              <ProtectedRoute>
                <Layout>
                  <SupplierMapPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bid-management"
            element={
              <ProtectedRoute>
                <Layout>
                  <BidManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier-bids"
            element={
              <ProtectedRoute>
                <Layout>
                  <SupplierBids />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserRegistration />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Users list for admin */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Reports route */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
