// src/pages/catalog/CatalogItemDetail.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCatalogItem } from '../../services/api';
import { 
  ArrowLeft, 
  Package, 
  Star, 
  DollarSign, 
  Calendar, 
  Users,
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

const CatalogItemDetail = () => {
  const { id } = useParams();
  const { data: item, isLoading } = useCatalogItem(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Item not found</h3>
        <p className="mt-1 text-sm text-gray-500">The catalog item you're looking for doesn't exist.</p>
        <Link to="/catalog" className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/catalog" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-gray-600">Catalog Item Details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {item.images && item.images.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
              <div className="grid grid-cols-2 gap-4">
                {item.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.alt || item.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* Specifications */}
          {item.specifications && Object.keys(item.specifications).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(item.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-900 capitalize">{key}:</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance */}
          {item.compliance && item.compliance.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance & Certifications</h2>
              <div className="space-y-3">
                {item.compliance.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{cert.standard}</p>
                      <p className="text-sm text-gray-600">
                        Certified: {cert.certified ? 'Yes' : 'No'}
                      </p>
                    </div>
                    {cert.certified ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing & Availability */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Availability</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Unit Price:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {item.unitPrice?.toLocaleString()} {item.currency}
                </span>
              </div>

              {item.discountedPrice && item.discountedPrice < item.unitPrice && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Discounted Price:</span>
                  <span className="text-xl font-bold text-green-600">
                    {item.discountedPrice.toLocaleString()} {item.currency}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Minimum Order:</span>
                <span className="font-medium">{item.minimumOrderQuantity} {item.uom}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Lead Time:</span>
                <span className="font-medium">{item.leadTimeDays} days</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Stock Quantity:</span>
                <span className={`font-medium ${
                  item.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.stockQuantity} {item.uom}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.status === 'active' ? 'bg-green-100 text-green-800' :
                  item.status === 'out_of_stock' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">{item.supplierId?.companyName}</p>
                <p className="text-gray-600">{item.supplierId?.email}</p>
              </div>
              
              {item.supplierId?.rating && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-gray-600">
                    {item.supplierId.rating.average?.toFixed(1)} ({item.supplierId.rating.count} reviews)
                  </span>
                </div>
              )}
              
              <Link
                to={`/suppliers/${item.supplierId?._id}`}
                className="inline-block text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View supplier profile →
              </Link>
            </div>
          </div>

          {/* Bulk Pricing */}
          {item.pricing?.bulk && item.pricing.bulk.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Pricing</h3>
              
              <div className="space-y-2 text-sm">
                {item.pricing.bulk.map((tier, index) => (
                  <div key={index} className="flex justify-between py-1">
                    <span className="text-gray-600">
                      {tier.minQuantity} - {tier.maxQuantity || '∞'} {item.uom}
                    </span>
                    <span className="font-medium">
                      {tier.price?.toLocaleString()} {item.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warranty */}
          {item.warranty && item.warranty.duration > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Warranty</h3>
              
              <div className="text-sm text-gray-600">
                <p>{item.warranty.duration} {item.warranty.unit}</p>
                {item.warranty.terms && (
                  <p className="mt-2">{item.warranty.terms}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogItemDetail;