// src/pages/bid/MyBids.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMyBids } from '../../services/api';
import { Search, Filter, FileText, DollarSign, Calendar, Award, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const MyBids = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  const { data, isLoading } = useMyBids({
    search: filters.search || undefined,
    status: filters.status || undefined,
    limit: 50
  });

  const bids = data?.data || [];

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800 border-blue-200',
      under_review: 'bg-purple-100 text-purple-800 border-purple-200',
      shortlisted: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      withdrawn: 'bg-gray-100 text-gray-800 border-gray-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Calculate bid statistics
  const stats = {
    total: bids.length,
    pending: bids.filter(bid => ['submitted', 'under_review'].includes(bid.status)).length,
    accepted: bids.filter(bid => bid.status === 'accepted').length,
    successRate: bids.length > 0 ? (bids.filter(bid => bid.status === 'accepted').length / bids.length * 100).toFixed(1) : 0
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
          <h1 className="text-2xl font-bold text-gray-900">My Bids</h1>
          <p className="text-gray-600">Track your bid submissions and status</p>
        </div>
        <Link
          to="/rfqs"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-sm"
        >
          <FileText className="h-4 w-4 mr-2" />
          Find RFQs
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Bids"
          value={stats.total}
          icon={<FileText className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<TrendingUp className="h-6 w-6" />}
          color="yellow"
        />
        <StatCard
          title="Accepted"
          value={stats.accepted}
          icon={<Award className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={<DollarSign className="h-6 w-6" />}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search my bids..."
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
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="draft">Draft</option>
          </select>

          <button
            onClick={() => setFilters({ search: '', status: '' })}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bids Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {bids.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bids submitted</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search || filters.status 
                  ? 'Try adjusting your filters' 
                  : "You haven't submitted any bids yet."
                }
              </p>
              {!filters.search && !filters.status && (
                <Link
                  to="/rfqs"
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Browse RFQs
                </Link>
              )}
            </div>
          </div>
        ) : (
          bids.map((bid) => (
            <BidCard key={bid._id} bid={bid} />
          ))
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', icon: 'text-green-600' },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color].bg}`}>
          <div className={colorClasses[color].icon}>
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const BidCard = ({ bid }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">
              {bid.bidNumber}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              For: {bid.rfqId?.title}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(bid.status)}`}>
            {bid.status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
            <span>Amount: {bid.pricing?.totalAmount?.toLocaleString()} {bid.pricing?.currency}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>Submitted: {format(new Date(bid.submittedAt), 'MMM dd, yyyy')}</span>
          </div>

          {bid.evaluationScore?.overall && (
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-gray-400" />
              <span>Score: {bid.evaluationScore.overall.toFixed(1)}</span>
            </div>
          )}

          {bid.items && (
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-gray-400" />
              <span>{bid.items.length} items</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            to={`/bids/${bid._id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View details →
          </Link>

          {bid.status === 'draft' && (
            <Link
              to={`/bids/create/${bid.rfqId?._id}?edit=${bid._id}`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Continue
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBids;