// src/pages/rfq/RFQs.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRFQs } from '../../services/api';
import { Plus, Search, Filter, Calendar, Users, DollarSign, FileText } from 'lucide-react';
import { format, differenceInDays, isAfter } from 'date-fns';

const RFQs = () => {
  const { canCreateRFQ } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: ''
  });

  const { data, isLoading, error } = useRFQs({
    search: filters.search || undefined,
    status: filters.status || undefined,
    category: filters.category || undefined,
    limit: 50
  });

  const rfqs = data?.data || [];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200',
      awarded: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadge = (rfq) => {
    if (rfq.status === 'open' && !isAfter(new Date(rfq.deadline), new Date())) {
      return {
        label: 'Expired',
        color: 'bg-orange-100 text-orange-800 border-orange-200'
      };
    }
    return {
      label: rfq.status,
      color: getStatusColor(rfq.status)
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-red-800">Error loading RFQs</h3>
          <p className="mt-1 text-sm text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request for Quotations</h1>
          <p className="text-gray-600">Browse and manage RFQs</p>
        </div>
        {canCreateRFQ && (
          <Link
            to="/rfqs/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create RFQ
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
              placeholder="Search RFQs..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="awarded">Awarded</option>
            <option value="cancelled">Cancelled</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
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
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* RFQs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {rfqs.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No RFQs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search || filters.status || filters.category 
                  ? 'Try adjusting your filters' 
                  : 'Get started by creating a new RFQ.'
                }
              </p>
              {canCreateRFQ && !filters.search && !filters.status && !filters.category && (
                <Link
                  to="/rfqs/create"
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create RFQ
                </Link>
              )}
            </div>
          </div>
        ) : (
          rfqs.map((rfq) => (
            <RFQCard key={rfq._id} rfq={rfq} />
          ))
        )}
      </div>
    </div>
  );
};

const RFQCard = ({ rfq }) => {
  const { isSupplier } = useAuth();
  const statusBadge = getStatusBadge(rfq);
  const daysLeft = differenceInDays(new Date(rfq.deadline), new Date());
  const isUrgent = daysLeft >= 0 && daysLeft <= 3;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 line-clamp-2">
              <Link 
                to={`/rfqs/${rfq._id}`} 
                className="hover:text-blue-600 transition-colors"
              >
                {rfq.title}
              </Link>
            </h3>
            <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {rfq.description}
        </p>

        {/* Details */}
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>Deadline: {format(new Date(rfq.deadline), 'MMM dd, yyyy')}</span>
            {isUrgent && (
              <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                Urgent
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-gray-400" />
            <span>{rfq.bidCount || 0} bids submitted</span>
          </div>

          {rfq.budget && (
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
              <span>Budget: {rfq.budget.max?.toLocaleString()} {rfq.budget.currency}</span>
            </div>
          )}

          {rfq.category && (
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-gray-400" />
              <span className="capitalize">{rfq.category}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            to={`/rfqs/${rfq._id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View details →
          </Link>

          {isSupplier && rfq.status === 'open' && daysLeft >= 0 && (
            <Link
              to={`/bids/create/${rfq._id}`}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Submit Bid
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RFQs;