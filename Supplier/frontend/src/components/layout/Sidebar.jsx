// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  ShoppingCart,
  Settings,
  Award,
  BarChart3
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
  const location = useLocation();
  const { isSupplier, user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'user', 'supplier'] },
    { name: 'RFQs', href: '/rfqs', icon: FileText, roles: ['admin', 'user', 'supplier'] },
    { name: 'My Bids', href: '/my-bids', icon: Package, roles: ['supplier'] },
    { name: 'All Bids', href: '/bids', icon: BarChart3, roles: ['admin'] },
    { name: 'Suppliers', href: '/suppliers', icon: Users, roles: ['admin', 'user'] },
    { name: 'Catalog', href: '/catalog', icon: ShoppingCart, roles: ['admin', 'user', 'supplier'] },
  ];

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role) || (isSupplier && item.roles.includes('supplier'))
  );

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Award className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">RFQ System</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {filteredNavigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={clsx(
              'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group',
              isActive(item.href)
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon className={clsx(
              'h-5 w-5 mr-3 flex-shrink-0',
              isActive(item.href) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
            )} />
            {item.name}
          </Link>
        ))}
      </nav>
      
      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/profile"
          className={clsx(
            'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
            location.pathname === '/profile'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <Settings className="h-5 w-5 mr-3 text-gray-400" />
          Profile & Settings
        </Link>
        
        {/* User Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize truncate">
                {user?.role}
                {isSupplier && ' • Supplier'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;