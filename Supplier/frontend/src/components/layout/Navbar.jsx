// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Bell, Search, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Search:', searchQuery);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Search */}
        <div className="flex-1 max-w-2xl mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search RFQs, suppliers, bids..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>
        </div>
        
        {/* User menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </button>
            
            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200">
              <a
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </a>
              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <a href="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">
              Dashboard
            </a>
            <a href="/rfqs" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">
              RFQs
            </a>
            <a href="/profile" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">
              Profile
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;