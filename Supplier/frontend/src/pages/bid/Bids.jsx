// src/pages/bid/Bids.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBids } from '../../services/api';
import { Search, Filter, FileText, DollarSign, Calendar, User, Award } from 'lucide-react';
import { format } from 'date-fns';

const Bids = () => {
  const { isAdmin } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    rfqId: ''
  });

  const { data, isLoading } = useBids({
    search: filters.search || undefined,
    status: filters.status || undefined,
    rfqId: filters.rfqId || undefined,
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
          <h1 className="text-2xl font-bold text-gray-900">All Bids</h1>
          <p className="text-gray-600">Manage and evaluate supplier bids</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search bids..."
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
          </select>

          <select
            value={filters.rfqId}
            onChange={(e) => setFilters({ ...filters, rfqId: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All RFQs</option>
            {/* RFQ options would be populated from API */}
          </select>

          <button
            onClick={() => setFilters({ search: '', status: '', rfqId: '' })}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bids Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {bids.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bids found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status ? 'Try adjusting your filters' : 'No bids have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bid Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RFQ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bids.map((bid) => (
                  <BidRow key={bid._id} bid={bid} isAdmin={isAdmin} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const BidRow = ({ bid, isAdmin }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {bid.bidNumber}
          </div>
          <div className="text-sm text-gray-500">
            {bid.items?.length || 0} items
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {bid.rfqId?.title || 'RFQ Details'}
        </div>
        <div className="text-sm text-gray-500">
          {bid.rfqId?.rfqNumber}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {bid.supplierId?.companyName || 'Supplier'}
        </div>
        <div className="text-sm text-gray-500">
          {bid.submittedBy?.name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {bid.pricing?.totalAmount?.toLocaleString()} {bid.pricing?.currency}
        </div>
        {bid.evaluationScore?.overall && (
          <div className="text-sm text-gray-500">
            Score: {bid.evaluationScore.overall.toFixed(1)}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {format(new Date(bid.submittedAt), 'MMM dd, yyyy')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(bid.status)}`}>
          {bid.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link
          to={`/bids/${bid._id}`}
          className="text-blue-600 hover:text-blue-900"
        >
          View
        </Link>
        {isAdmin && bid.status === 'submitted' && (
          <>
          <span className="mx-2 text-gray-300">|</span>
          <button className="text-green-600 hover:text-green-900">
            Evaluate
          </button>
          </>
        )}
      </td>
    </tr>
  );
};

export default Bids;