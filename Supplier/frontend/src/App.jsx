// src/App.jsx - Add DebugAuth component
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import DebugAuth from './components/DebugAuth'; // Add this
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import RFQs from './pages/rfq/RFQs';
import RFQDetail from './pages/rfq/RFQDetail';
import CreateRFQ from './pages/rfq/CreateRFQ';
import Bids from './pages/bid/Bids';
import MyBids from './pages/bid/MyBids';
import CreateBid from './pages/bid/CreateBid';
import BidDetail from './pages/bid/BidDetail';
import Suppliers from './pages/supplier/Suppliers';
import SupplierDetail from './pages/supplier/SupplierDetail';
import CreateSupplier from './pages/supplier/CreateSupplier';
import Catalog from './pages/catalog/Catalog';
import CatalogItemDetail from './pages/catalog/CatalogItemDetail';
import CreateCatalogItem from './pages/catalog/CreateCatalogItem';
import Profile from './pages/auth/Profile';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <div className="App min-h-screen bg-gray-50">
                <DebugAuth /> {/* Add this line */}
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected routes */}
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/rfqs" element={<RFQs />} />
                          <Route path="/rfqs/:id" element={<RFQDetail />} />
                          <Route path="/rfqs/create" element={<CreateRFQ />} />
                          <Route path="/bids" element={<Bids />} />
                          <Route path="/bids/:id" element={<BidDetail />} />
                          <Route path="/my-bids" element={<MyBids />} />
                          <Route path="/bids/create/:rfqId" element={<CreateBid />} />
                          <Route path="/suppliers" element={<Suppliers />} />
                          <Route path="/suppliers/:id" element={<SupplierDetail />} />
                          <Route path="/suppliers/create" element={<CreateSupplier />} />
                          <Route path="/catalog" element={<Catalog />} />
                          <Route path="/catalog/:id" element={<CatalogItemDetail />} />
                          <Route path="/catalog/create" element={<CreateCatalogItem />} />
                          <Route path="/profile" element={<Profile />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  } />
                </Routes>
              </div>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;