// src/pages/catalog/Catalog.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCatalog } from '../../services/api'; // Now this will work!
import { Search, Filter, Package, Star, ShoppingCart, Plus } from 'lucide-react';

const Catalog = () => {
  const { canManageSuppliers } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'active'
  });

  const { data, isLoading } = useCatalog({
    search: filters.search || undefined,
    category: filters.category || undefined,
    status: filters.status || undefined,
    limit: 50
  });

  const catalogItems = data?.data || [];

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      discontinued: 'bg-red-100 text-red-800 border-red-200',
      out_of_stock: 'bg-orange-100 text-orange-800 border-orange-200',
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
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-600">Browse supplier products and services</p>
        </div>
        {canManageSuppliers && (
          <Link
            to="/catalog/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
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
              placeholder="Search catalog..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
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
            <option value="raw-materials">Raw Materials</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
          </select>

          <button
            onClick={() => setFilters({ search: '', category: '', status: 'active' })}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {catalogItems.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No catalog items found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search || filters.category || filters.status !== 'active' 
                  ? 'Try adjusting your filters' 
                  : 'Get started by adding a new catalog item.'
                }
              </p>
              {canManageSuppliers && !filters.search && !filters.category && filters.status === 'active' && (
                <Link
                  to="/catalog/create"
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Link>
              )}
            </div>
          </div>
        ) : (
          catalogItems.map((item) => (
            <CatalogItemCard key={item._id} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

const CatalogItemCard = ({ item }) => {
  const discountedPrice = item.discountedPrice || item.unitPrice;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Image Placeholder */}
      <div className="h-48 bg-gray-200 rounded-t-xl flex items-center justify-center">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images.find(img => img.isPrimary)?.url || item.images[0].url}
            alt={item.name}
            className="h-full w-full object-cover rounded-t-xl"
          />
        ) : (
          <Package className="h-12 w-12 text-gray-400" />
        )}
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
            {item.name}
          </h3>
          <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
            {item.status.replace('_', ' ')}
          </span>
        </div>

        {/* Supplier */}
        <p className="text-sm text-gray-600 mb-3">
          by {item.supplierId?.companyName || 'Supplier'}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {item.description}
        </p>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {discountedPrice.toLocaleString()} {item.currency}
            </span>
            {item.discountedPrice && item.discountedPrice < item.unitPrice && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                {item.unitPrice.toLocaleString()} {item.currency}
              </span>
            )}
          </div>
          
          {item.rating?.average > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              {item.rating.average.toFixed(1)}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
          <div>
            <span className="font-medium">MOQ:</span> {item.minimumOrderQuantity}
          </div>
          <div>
            <span className="font-medium">Lead Time:</span> {item.leadTimeDays}d
          </div>
          <div>
            <span className="font-medium">Stock:</span> {item.stockQuantity}
          </div>
          <div>
            <span className="font-medium">UOM:</span> {item.uom}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            to={`/catalog/${item._id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View details →
          </Link>

          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <ShoppingCart className="h-3 w-3 mr-1" />
            Add to RFQ
          </button>
        </div>
      </div>
    </div>
  );
};

export default Catalog;