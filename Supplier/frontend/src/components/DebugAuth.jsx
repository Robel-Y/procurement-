// src/components/DebugAuth.jsx - For debugging only
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugAuth = () => {
  const { user, loading, token, isAdmin, isSupplier } = useAuth();

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug Info:</h3>
      <div className="space-y-1">
        <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
        <div><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</div>
        <div><strong>Token:</strong> {token ? 'Exists' : 'Missing'}</div>
        <div><strong>Role:</strong> {user?.role}</div>
        <div><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</div>
        <div><strong>Is Supplier:</strong> {isSupplier ? 'Yes' : 'No'}</div>
        <div><strong>Supplier ID:</strong> {user?.supplierId || 'None'}</div>
      </div>
    </div>
  );
};

export default DebugAuth;