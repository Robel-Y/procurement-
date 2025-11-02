// src/pages/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRFQs, useMyBids, useSuppliers } from '../services/api';
import { 
  FileText, 
  Users, 
  Package, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Award,
  BarChart3
} from 'lucide-react';
import { format, differenceInDays, isAfter } from 'date-fns';

const Dashboard = () => {
  const { user, isAdmin, isSupplier } = useAuth();
  
  const { data: rfqsData, isLoading: rfqsLoading } = useRFQs({ 
    limit: 100,
    sortBy: 'createdAt', 
    sortOrder: 'desc' 
  });
  
  const { data: bidsData, isLoading: bidsLoading } = useMyBids({ 
    limit: 100 
  });
  
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({ 
    limit: 100 
  });

  const rfqs = rfqsData?.data || [];
  const bids = bidsData?.data || [];
  const suppliers = suppliersData?.data || [];

  // Calculate statistics
  const stats = {
    totalRFQs: rfqs.length,
    totalBids: bids.length,
    totalSuppliers: suppliers.length,
    activeRFQs: rfqs.filter(rfq => 
      rfq.status === 'open' && isAfter(new Date(rfq.deadline), new Date())
    ).length,
    pendingBids: bids.filter(bid => 
      ['submitted', 'under_review'].includes(bid.status)
    ).length,
    awardedBids: bids.filter(bid => bid.status === 'accepted').length,
  };

  // Get recent and urgent RFQs
  const recentRFQs = rfqs.slice(0, 5);
  const urgentRFQs = rfqs.filter(rfq => 
    rfq.status === 'open' && 
    differenceInDays(new Date(rfq.deadline), new Date()) <= 3
  ).slice(0, 3);

  const recentBids = bids.slice(0, 5);

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200',
      awarded: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      expired: 'bg-orange-100 text-orange-800 border-orange-200',
      submitted: 'bg-blue-100 text-blue-800 border-blue-200',
      under_review: 'bg-purple-100 text-purple-800 border-purple-200',
      shortlisted: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      withdrawn: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: <CheckCircle className="h-4 w-4" />,
      closed: <Clock className="h-4 w-4" />,
      awarded: <Award className="h-4 w-4" />,
      submitted: <FileText className="h-4 w-4" />,
      accepted: <CheckCircle className="h-4 w-4" />,
      rejected: <AlertTriangle className="h-4 w-4" />,
    };
    return icons[status] || <FileText className="h-4 w-4" />;
  };

  if (rfqsLoading || bidsLoading || suppliersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? 'Manage RFQs and evaluate bids' : 
               isSupplier ? 'Track your bids and find new opportunities' : 
               'View RFQs and supplier information'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {user?.role}
            </span>
            {isSupplier && user?.supplierId && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Supplier
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total RFQs"
          value={stats.totalRFQs}
          change={stats.activeRFQs}
          changeText="active"
          icon={<FileText className="h-6 w-6" />}
          color="blue"
          href="/rfqs/posts"
        />
        {isAdmin ? (
        <StatCard
          title="All Bids"
          value={stats.totalBids}
          change={stats.pendingBids}
          changeText="pending"
          icon={<Package className="h-6 w-6" />}
          color="green"
          href="/bids"
        />) : (
          <StatCard
          title="My Bids"
          value={stats.totalBids}
          change={stats.pendingBids}
          changeText="pending"
          icon={<Package className="h-6 w-6" />}
          color="green"
          href="/my-bids"
        />
        )}
        <StatCard
          title="Suppliers"
          value={stats.totalSuppliers}
          change={stats.awardedBids}
          changeText="awards"
          icon={<Users className="h-6 w-6" />}
          color="purple"
          href="/suppliers"
        />
        <StatCard
          title="Performance"
          value={`${stats.awardedBids}/${stats.totalBids}`}
          change={stats.totalBids > 0 ? Math.round((stats.awardedBids / stats.totalBids) * 100) : 0}
          changeText="success rate"
          icon={<TrendingUp className="h-6 w-6" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent RFQs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Recent RFQs
            </h2>
            <Link 
              to="/rfqs" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="p-6">
            {recentRFQs.length === 0 ? (
              <EmptyState 
                icon={<FileText className="h-8 w-8 text-gray-400" />}
                title="No RFQs"
                description="There are no RFQs available yet."
              />
            ) : (
              <div className="space-y-4">
                {recentRFQs.map((rfq) => (
                  <RFQCard key={rfq._id} rfq={rfq} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Bids */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-green-600" />
              My Recent Bids
            </h2>
            <Link 
              to="/my-bids" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="p-6">
            {recentBids.length === 0 ? (
              <EmptyState 
                icon={<Package className="h-8 w-8 text-gray-400" />}
                title="No Bids"
                description="You haven't submitted any bids yet."
                action={
                  <Link
                    to="/rfqs"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Find RFQs
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {recentBids.map((bid) => (
                  <BidCard key={bid._id} bid={bid} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Urgent RFQs Section */}
      {urgentRFQs.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-orange-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Urgent RFQs - Closing Soon
            </h2>
            <span className="text-sm text-orange-700 font-medium">
              {urgentRFQs.length} urgent
            </span>
          </div>
          <div className="grid gap-4">
            {urgentRFQs.map((rfq) => (
              <div key={rfq._id} className="bg-white rounded-lg p-4 border border-orange-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{rfq.title}</h3>
                    <p className="text-sm text-orange-600">
                      Deadline: {format(new Date(rfq.deadline), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <Link
                    to={`/bids/create/${rfq._id}`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
                  >
                    Submit Bid
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, change, changeText, icon, color, href }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-700' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', text: 'text-green-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-700' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', text: 'text-orange-700' },
  };

  const cardContent = (
    <div className={`p-6 rounded-xl border border-gray-200 hover:border-${color}-300 transition-colors ${href ? 'cursor-pointer hover:shadow-md' : ''}`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color].bg}`}>
          <div className={colorClasses[color].icon}>
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${colorClasses[color].text}`}>
              {change} {changeText}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link to={href}>
      {cardContent}
    </Link>
  ) : cardContent;
};

const RFQCard = ({ rfq }) => {
  const { isSupplier } = useAuth();
  const daysLeft = differenceInDays(new Date(rfq.deadline), new Date());

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 truncate">
            {rfq.title}
          </h3>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(rfq.status)}`}>
            {rfq.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1 truncate">{rfq.description}</p>
        
        <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
          <span>Deadline: {format(new Date(rfq.deadline), 'MMM dd, yyyy')}</span>
          <span>{rfq.bidCount || 0} bids</span>
          {daysLeft >= 0 && (
            <span className={daysLeft <= 3 ? 'text-orange-600 font-medium' : ''}>
              {daysLeft === 0 ? 'Today' : `${daysLeft} days left`}
            </span>
          )}
        </div>
      </div>
      
      {isSupplier && rfq.status === 'open' && daysLeft >= 0 && (
        <Link
          to={`/bids/create/${rfq._id}`}
          className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Bid
        </Link>
      )}
    </div>
  );
};

const BidCard = ({ bid }) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">
            Bid #{bid.bidNumber}
          </h3>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bid.status)}`}>
            {bid.status}
          </span>
        </div>
        
        <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
          <span>Amount: {bid.pricing?.totalAmount?.toLocaleString()} {bid.pricing?.currency}</span>
          <span>Submitted: {format(new Date(bid.submittedAt), 'MMM dd, yyyy')}</span>
          {bid.evaluationScore?.overall && (
            <span>Score: {bid.evaluationScore.overall.toFixed(1)}</span>
          )}
        </div>
      </div>
      
      <Link
        to={`/bids/${bid._id}`}
        className="ml-4 inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        View
      </Link>
    </div>
  );
};

const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center py-8">
    <div className="mx-auto h-12 w-12 text-gray-400">
      {icon}
    </div>
    <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default Dashboard;