// src/pages/bid/BidDetail.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBids } from '../../services/api';
import { format } from 'date-fns';

// src/pages/bid/BidDetail.jsx - Update imports
import { 
  ArrowLeft, 
  FileText, 
  DollarSign, 
  Calendar, 
  User, 
  Package,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Truck
} from 'lucide-react';

const BidDetail = () => {
  const { id } = useParams();
  const { isAdmin, isSupplier, user } = useAuth();
  
  const { data: bidsData, isLoading } = useBids();
  const bid = bidsData?.data?.find(b => b._id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bid) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Bid not found</h3>
        <p className="mt-1 text-sm text-gray-500">The bid you're looking for doesn't exist.</p>
        <Link to="/my-bids" className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to My Bids
        </Link>
      </div>
    );
  }

  // Check if user has permission to view this bid
  const canView = isAdmin || (isSupplier && bid.supplierId?._id === user.supplierId);

  if (!canView) {
    return (
      <div className="text-center py-12">
        <XCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500">You don't have permission to view this bid.</p>
        <Link to="/my-bids" className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to My Bids
        </Link>
      </div>
    );
  }

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

  const getStatusIcon = (status) => {
    const icons = {
      submitted: <Clock className="h-4 w-4" />,
      under_review: <FileText className="h-4 w-4" />,
      shortlisted: <Award className="h-4 w-4" />,
      accepted: <CheckCircle className="h-4 w-4" />,
      rejected: <XCircle className="h-4 w-4" />,
    };
    return icons[status] || <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={isAdmin ? "/bids" : "/my-bids"} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bid #{bid.bidNumber}</h1>
            <p className="text-gray-600">for {bid.rfqId?.title}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(bid.status)}`}>
            {getStatusIcon(bid.status)}
            <span className="ml-2 capitalize">{bid.status.replace('_', ' ')}</span>
          </span>
          
          {isAdmin && bid.status === 'submitted' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Evaluate Bid
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bid Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bid Items</h2>
            <div className="space-y-4">
              {bid.items?.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{item.itemName}</h3>
                    <span className="text-sm text-gray-500">
                      {item.quantity} {item.uom}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Unit Price:</span>
                      <p className="font-medium">{item.unitPrice?.toLocaleString()} {bid.pricing?.currency}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Price:</span>
                      <p className="font-medium">{item.totalPrice?.toLocaleString()} {bid.pricing?.currency}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Lead Time:</span>
                      <p className="font-medium">{item.leadTimeDays} days</p>
                    </div>
                  </div>
                  
                  {item.notes && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Notes:</span>
                      <p className="mt-1">{item.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Pricing Breakdown
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{bid.pricing?.subtotal?.toLocaleString()} {bid.pricing?.currency}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">{bid.pricing?.tax?.toLocaleString()} {bid.pricing?.currency}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">{bid.pricing?.shipping?.toLocaleString()} {bid.pricing?.currency}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-green-600">-{bid.pricing?.discount?.toLocaleString()} {bid.pricing?.currency}</span>
              </div>
              
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {bid.pricing?.totalAmount?.toLocaleString()} {bid.pricing?.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          {(bid.deliveryTerms || bid.paymentTerms || bid.warranty) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delivery Terms */}
                {bid.deliveryTerms && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Delivery Terms</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      {bid.deliveryTerms.estimatedDeliveryDate && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {format(new Date(bid.deliveryTerms.estimatedDeliveryDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      )}
                      {bid.deliveryTerms.deliveryLocation && (
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          <span>{bid.deliveryTerms.deliveryLocation}</span>
                        </div>
                      )}
                      {bid.deliveryTerms.shippingMethod && (
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 mr-2" />
                          <span>{bid.deliveryTerms.shippingMethod}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment & Warranty */}
                <div className="space-y-4">
                  {bid.paymentTerms && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Payment Terms</h3>
                      <div className="text-sm text-gray-600">
                        <p>{bid.paymentTerms.method}</p>
                        {bid.paymentTerms.advancePaymentPercentage > 0 && (
                          <p className="mt-1">
                            Advance: {bid.paymentTerms.advancePaymentPercentage}%
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {bid.warranty && bid.warranty.duration > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Warranty</h3>
                      <div className="text-sm text-gray-600">
                        <p>{bid.warranty.duration} {bid.warranty.unit}</p>
                        {bid.warranty.terms && (
                          <p className="mt-1">{bid.warranty.terms}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Evaluation Results (Admin only) */}
          {isAdmin && bid.evaluationScore && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Evaluation Results
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{bid.evaluationScore.technical}</div>
                  <div className="text-sm text-gray-600">Technical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{bid.evaluationScore.commercial}</div>
                  <div className="text-sm text-gray-600">Commercial</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{bid.evaluationScore.delivery}</div>
                  <div className="text-sm text-gray-600">Delivery</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{bid.evaluationScore.overall?.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Overall</div>
                </div>
              </div>
              
              {bid.evaluationNotes && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Evaluation Notes</h4>
                  <p className="text-sm text-gray-600">{bid.evaluationNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Rejection Reason */}
          {bid.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                Rejection Reason
              </h3>
              <p className="text-red-700">{bid.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bid Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bid Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Submitted</p>
                  <p className="text-gray-600">
                    {format(new Date(bid.submittedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <User className="h-4 w-4 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Submitted By</p>
                  <p className="text-gray-600">{bid.submittedBy?.name}</p>
                  <p className="text-gray-500 text-xs">{bid.submittedBy?.email}</p>
                </div>
              </div>

              {bid.validUntil && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Valid Until</p>
                    <p className="text-gray-600">
                      {format(new Date(bid.validUntil), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}

              {bid.reviewedAt && (
                <div className="flex items-center text-sm">
                  <FileText className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Reviewed</p>
                    <p className="text-gray-600">
                      {format(new Date(bid.reviewedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Supplier Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">{bid.supplierId?.companyName}</p>
                <p className="text-gray-600">{bid.supplierId?.email}</p>
                {bid.supplierId?.phone && (
                  <p className="text-gray-600">{bid.supplierId?.phone}</p>
                )}
              </div>
              
              {bid.supplierId?.rating && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-gray-600">
                    {bid.supplierId.rating.average?.toFixed(1)} ({bid.supplierId.rating.count} reviews)
                  </span>
                </div>
              )}
              
              <Link
                to={`/suppliers/${bid.supplierId?._id}`}
                className="inline-block text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View supplier profile →
              </Link>
            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-2">
                {bid.status === 'submitted' && (
                  <>
                    <button className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded">
                      Shortlist Bid
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                      Evaluate Bid
                    </button>
                  </>
                )}
                
                {bid.status === 'shortlisted' && (
                  <button className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded">
                    Accept Bid
                  </button>
                )}
                
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                  Reject Bid
                </button>
                
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                  Request Revision
                </button>
              </div>
            </div>
          )}

          {/* Supplier Actions */}
          {isSupplier && bid.supplierId?._id === user.supplierId && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-2">
                {['draft', 'submitted'].includes(bid.status) && (
                  <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                    Edit Bid
                  </button>
                )}
                
                {['draft', 'submitted', 'under_review'].includes(bid.status) && (
                  <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                    Withdraw Bid
                  </button>
                )}
                
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidDetail;