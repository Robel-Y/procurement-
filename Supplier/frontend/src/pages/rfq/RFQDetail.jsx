// src/pages/rfq/RFQDetail.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRFQs, useBids } from '../../services/api';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  FileText, 
  Package,
  MapPin,
  Clock,
  Award
} from 'lucide-react';
import { format, differenceInDays, isAfter } from 'date-fns';

const RFQDetail = () => {
  const { id } = useParams();
  const { isSupplier, isAdmin } = useAuth();
  
  const { data: rfqData, isLoading: rfqLoading } = useRFQs();
  const { data: bidsData, isLoading: bidsLoading } = useBids({ rfqId: id });

  const rfq = rfqData?.data?.find(r => r._id === id);
  const bids = bidsData?.data || [];

  if (rfqLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">RFQ not found</h3>
        <p className="mt-1 text-sm text-gray-500">The RFQ you're looking for doesn't exist.</p>
        <Link to="/rfqs" className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to RFQs
        </Link>
      </div>
    );
  }

  const daysLeft = differenceInDays(new Date(rfq.deadline), new Date());
  const isExpired = !isAfter(new Date(rfq.deadline), new Date());
  const canBid = isSupplier && rfq.status === 'open' && !isExpired;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/rfqs" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{rfq.title}</h1>
            <p className="text-gray-600">RFQ #{rfq.rfqNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            rfq.status === 'open' && !isExpired 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : rfq.status === 'awarded'
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}>
            {isExpired && rfq.status === 'open' ? 'Expired' : rfq.status}
          </span>
          
          {canBid && (
            <Link
              to={`/bids/create/${rfq._id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-sm"
            >
              <Package className="h-4 w-4 mr-2" />
              Submit Bid
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{rfq.description}</p>
          </div>

          {/* Items */}
          {rfq.items && rfq.items.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Items Required</h2>
              <div className="space-y-4">
                {rfq.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{item.itemName}</h3>
                      <span className="text-sm text-gray-500">Qty: {item.quantity} {item.uom}</span>
                    </div>
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    )}
                    {item.specifications && Object.keys(item.specifications).length > 0 && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Specifications:</span>
                        <ul className="mt-1 list-disc list-inside">
                          {Object.entries(item.specifications).map(([key, value]) => (
                            <li key={key}>{value}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {rfq.requirements && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {rfq.requirements.technicalSpecs && (
                  <div>
                    <span className="font-medium text-gray-900">Technical Specifications:</span>
                    <p className="text-gray-600 mt-1">{rfq.requirements.technicalSpecs}</p>
                  </div>
                )}
                {rfq.requirements.qualityStandards && (
                  <div>
                    <span className="font-medium text-gray-900">Quality Standards:</span>
                    <p className="text-gray-600 mt-1">{rfq.requirements.qualityStandards}</p>
                  </div>
                )}
                {rfq.requirements.deliveryTerms && (
                  <div>
                    <span className="font-medium text-gray-900">Delivery Terms:</span>
                    <p className="text-gray-600 mt-1">{rfq.requirements.deliveryTerms}</p>
                  </div>
                )}
                {rfq.requirements.paymentTerms && (
                  <div>
                    <span className="font-medium text-gray-900">Payment Terms:</span>
                    <p className="text-gray-600 mt-1">{rfq.requirements.paymentTerms}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Information</h3>
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Deadline</p>
                  <p className="text-gray-600">
                    {format(new Date(rfq.deadline), 'MMM dd, yyyy HH:mm')}
                  </p>
                  {daysLeft >= 0 && (
                    <p className={`text-sm ${daysLeft <= 3 ? 'text-orange-600' : 'text-gray-500'}`}>
                      {daysLeft === 0 ? 'Due today' : `${daysLeft} days left`}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Bids Received</p>
                  <p className="text-gray-600">{bids.length} bids</p>
                </div>
              </div>

              {rfq.budget && (
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Budget</p>
                    <p className="text-gray-600">
                      {rfq.budget.min?.toLocaleString()} - {rfq.budget.max?.toLocaleString()} {rfq.budget.currency}
                    </p>
                  </div>
                </div>
              )}

              {rfq.deliveryLocation && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Delivery Location</p>
                    <p className="text-gray-600">{rfq.deliveryLocation.address}</p>
                  </div>
                </div>
              )}

              {rfq.category && (
                <div className="flex items-center text-sm">
                  <FileText className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Category</p>
                    <p className="text-gray-600 capitalize">{rfq.category}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {rfq.contactPerson && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Person</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">{rfq.contactPerson.name}</p>
                <p className="text-gray-600">{rfq.contactPerson.position}</p>
                <p className="text-gray-600">{rfq.contactPerson.email}</p>
                {rfq.contactPerson.phone && (
                  <p className="text-gray-600">{rfq.contactPerson.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Bids Summary */}
          {isAdmin && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bids Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Bids:</span>
                  <span className="font-medium text-gray-900">{bids.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Under Review:</span>
                  <span className="font-medium text-yellow-600">
                    {bids.filter(bid => bid.status === 'under_review').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shortlisted:</span>
                  <span className="font-medium text-blue-600">
                    {bids.filter(bid => bid.status === 'shortlisted').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Awarded:</span>
                  <span className="font-medium text-green-600">
                    {bids.filter(bid => bid.status === 'accepted').length}
                  </span>
                </div>
              </div>
              {bids.length > 0 && (
                <Link
                  to={`/bids?rfqId=${rfq._id}`}
                  className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View All Bids
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RFQDetail;