// src/pages/supplier/SupplierDetail.jsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSuppliers } from '../../services/api';
import { 
  ArrowLeft, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Award,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';

const SupplierDetail = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: suppliersData, isLoading } = useSuppliers();
  const supplier = suppliersData?.data?.find(s => s._id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Supplier not found</h3>
        <p className="mt-1 text-sm text-gray-500">The supplier you're looking for doesn't exist.</p>
        <Link to="/suppliers" className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Suppliers
        </Link>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/suppliers" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{supplier.companyName}</h1>
            <p className="text-gray-600">Supplier Profile</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(supplier.status)}`}>
            {supplier.status === 'active' && <CheckCircle className="h-4 w-4 mr-1" />}
            {supplier.status === 'pending' && <Calendar className="h-4 w-4 mr-1" />}
            {supplier.status === 'rejected' && <XCircle className="h-4 w-4 mr-1" />}
            {supplier.status === 'suspended' && <XCircle className="h-4 w-4 mr-1" />}
            <span className="capitalize">{supplier.status}</span>
          </span>
          
          {isAdmin && (
            <div className="relative group">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-5 w-5" />
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200">
                {supplier.status === 'pending' && (
                  <>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </>
                )}
                {supplier.status === 'active' && (
                  <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <XCircle className="h-4 w-4 mr-2" />
                    Suspend
                  </button>
                )}
                {supplier.status === 'suspended' && (
                  <button className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'performance', 'documents', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && <OverviewTab supplier={supplier} />}
          {activeTab === 'performance' && <PerformanceTab supplier={supplier} />}
          {activeTab === 'documents' && <DocumentsTab supplier={supplier} />}
          {activeTab === 'history' && <HistoryTab supplier={supplier} />}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-gray-600">{supplier.email}</p>
                </div>
              </div>

              {supplier.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">{supplier.phone}</p>
                  </div>
                </div>
              )}

              {supplier.address && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">{supplier.fullAddress}</p>
                  </div>
                </div>
              )}

              {supplier.contactPerson && (
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Contact Person</p>
                    <p className="text-gray-600">{supplier.contactPerson.name}</p>
                    {supplier.contactPerson.position && (
                      <p className="text-gray-500 text-xs">{supplier.contactPerson.position}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Details */}
          {supplier.businessDetails && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
              
              <div className="space-y-3 text-sm">
                {supplier.businessDetails.registrationNumber && (
                  <div>
                    <span className="font-medium text-gray-900">Registration #:</span>
                    <p className="text-gray-600">{supplier.businessDetails.registrationNumber}</p>
                  </div>
                )}
                
                {supplier.businessDetails.taxId && (
                  <div>
                    <span className="font-medium text-gray-900">Tax ID:</span>
                    <p className="text-gray-600">{supplier.businessDetails.taxId}</p>
                  </div>
                )}
                
                {supplier.businessDetails.website && (
                  <div>
                    <span className="font-medium text-gray-900">Website:</span>
                    <a href={supplier.businessDetails.website} className="text-blue-600 hover:text-blue-700">
                      {supplier.businessDetails.website}
                    </a>
                  </div>
                )}
                
                {supplier.businessDetails.yearEstablished && (
                  <div>
                    <span className="font-medium text-gray-900">Established:</span>
                    <p className="text-gray-600">{supplier.businessDetails.yearEstablished}</p>
                  </div>
                )}
                
                {supplier.businessDetails.numberOfEmployees && (
                  <div>
                    <span className="font-medium text-gray-900">Employees:</span>
                    <p className="text-gray-600">{supplier.businessDetails.numberOfEmployees}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rating & Reviews */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating & Reviews</h3>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-8 w-8 text-yellow-400 mr-2" />
                <span className="text-3xl font-bold text-gray-900">
                  {supplier.rating?.average?.toFixed(1) || '0.0'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {supplier.rating?.count || 0} reviews
              </p>
              
              <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                Rate Supplier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OverviewTab = ({ supplier }) => {
  return (
    <div className="space-y-6">
      {/* Categories */}
      {supplier.categories && supplier.categories.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {supplier.categories.map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {supplier.certifications && supplier.certifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
          <div className="space-y-3">
            {supplier.certifications.map((cert, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{cert.name}</p>
                  <p className="text-sm text-gray-600">Issued by: {cert.issuedBy}</p>
                  {cert.issuedDate && (
                    <p className="text-xs text-gray-500">
                      Issued: {format(new Date(cert.issuedDate), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
                {cert.expiryDate && new Date(cert.expiryDate) > new Date() ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Summary */}
      {supplier.performanceMetrics && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Performance Summary
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{supplier.performanceMetrics.totalBids}</div>
              <div className="text-sm text-gray-600">Total Bids</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{supplier.performanceMetrics.wonBids}</div>
              <div className="text-sm text-gray-600">Won Bids</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{supplier.winRate}%</div>
              <div className="text-sm text-gray-600">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{supplier.performanceMetrics.completedOrders}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {supplier.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{supplier.notes}</p>
        </div>
      )}
    </div>
  );
};

const PerformanceTab = ({ supplier }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Bid Performance</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Bids Submitted</span>
              <span className="font-medium">{supplier.performanceMetrics?.totalBids || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bids Won</span>
              <span className="font-medium text-green-600">{supplier.performanceMetrics?.wonBids || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Win Rate</span>
              <span className="font-medium text-blue-600">{supplier.winRate || 0}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Delivery Performance</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Completed Orders</span>
              <span className="font-medium">{supplier.performanceMetrics?.completedOrders || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">On-Time Delivery Rate</span>
              <span className="font-medium text-purple-600">
                {supplier.performanceMetrics?.onTimeDeliveryRate || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quality Score</span>
              <span className="font-medium text-orange-600">
                {supplier.performanceMetrics?.qualityScore || 0}/10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
        <div className="text-center py-8">
          <FileText className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No recent activity</p>
        </div>
      </div>
    </div>
  );
};

const DocumentsTab = ({ supplier }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Documents</h3>
      
      {supplier.documents && supplier.documents.length > 0 ? (
        <div className="space-y-4">
          {supplier.documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.type} • {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Download
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">No documents have been uploaded yet.</p>
        </div>
      )}
    </div>
  );
};

const HistoryTab = ({ supplier }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">History & Timeline</h3>
      
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No history available</h3>
        <p className="mt-1 text-sm text-gray-500">Supplier history will appear here.</p>
      </div>
    </div>
  );
};

export default SupplierDetail;