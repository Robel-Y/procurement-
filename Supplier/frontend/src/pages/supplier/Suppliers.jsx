// src/pages/supplier/Suppliers.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSuppliers } from '../../services/api';
import { Search, Filter, Users, Star, MapPin, Phone, Mail, Award } from 'lucide-react';

const Suppliers = () => {
  const { canManageSuppliers } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: ''
  });

  const { data, isLoading } = useSuppliers({
    search: filters.search || undefined,
    status: filters.status || undefined,
    category: filters.category || undefined,
    limit: 50
  });

  const suppliers = data?.data || [];

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
      rejected: 'bg-gray-100 text-gray-800 border-gray-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600">Manage supplier relationships and performance</p>
        </div>
        {canManageSuppliers && (
          <Link
            to="/suppliers/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Add Supplier
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="construction">Construction</option>
            <option value="office-supplies">Office Supplies</option>
            <option value="services">Services</option>
          </select>

          <button
            onClick={() => setFilters({ search: '', status: '', category: '' })}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {suppliers.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search || filters.status || filters.category 
                  ? 'Try adjusting your filters' 
                  : 'Get started by adding a new supplier.'
                }
              </p>
              {canManageSuppliers && !filters.search && !filters.status && !filters.category && (
                <Link
                  to="/suppliers/create"
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add Supplier
                </Link>
              )}
            </div>
          </div>
        ) : (
          suppliers.map((supplier) => (
            <SupplierCard key={supplier._id} supplier={supplier} canManage={canManageSuppliers} />
          ))
        )}
      </div>
    </div>
  );
};

const SupplierCard = ({ supplier, canManage }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              <Link 
                to={`/suppliers/${supplier._id}`} 
                className="hover:text-blue-600 transition-colors"
              >
                {supplier.companyName}
              </Link>
            </h3>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(supplier.status)}`}>
                {supplier.status}
              </span>
              {supplier.rating?.average > 0 && (
                <div className="flex items-center text-xs text-gray-600">
                  <Star className="h-3 w-3 text-yellow-400 mr-1" />
                  {supplier.rating.average.toFixed(1)} ({supplier.rating.count})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          {supplier.contactPerson && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-gray-400" />
              <span>{supplier.contactPerson.name}</span>
            </div>
          )}
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">{supplier.email}</span>
          </div>
          {supplier.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <span>{supplier.phone}</span>
            </div>
          )}
          {supplier.address && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span className="truncate">{supplier.fullAddress}</span>
            </div>
          )}
        </div>

        {/* Categories & Performance */}
        <div className="space-y-3 text-sm">
          {supplier.categories && supplier.categories.length > 0 && (
            <div>
              <span className="font-medium text-gray-900">Categories:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {supplier.categories.slice(0, 3).map((category, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    {category}
                  </span>
                ))}
                {supplier.categories.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    +{supplier.categories.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {supplier.performanceMetrics && (
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-600">Total Bids:</span>
                <span className="ml-1 font-medium">{supplier.performanceMetrics.totalBids}</span>
              </div>
              <div>
                <span className="text-gray-600">Win Rate:</span>
                <span className="ml-1 font-medium text-green-600">
                  {supplier.winRate}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Completed:</span>
                <span className="ml-1 font-medium">{supplier.performanceMetrics.completedOrders}</span>
              </div>
              <div>
                <span className="text-gray-600">On Time:</span>
                <span className="ml-1 font-medium text-blue-600">
                  {supplier.performanceMetrics.onTimeDeliveryRate}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            to={`/suppliers/${supplier._id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View details →
          </Link>

          {canManage && supplier.status === 'pending' && (
            <div className="flex space-x-2">
              <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                Approve
              </button>
              <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Suppliers;