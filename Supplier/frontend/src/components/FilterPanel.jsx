// src/components/FilterPanel.jsx
import React from 'react';
import { Filter, X } from 'lucide-react';

const FilterPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  filterConfig = [],
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="h-4 w-4 text-gray-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        </div>
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filterConfig.map((filter) => (
          <div key={filter.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            {filter.type === 'select' ? (
              <select
                value={filters[filter.key] || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : filter.type === 'date' ? (
              <input
                type="date"
                value={filters[filter.key] || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <input
                type="text"
                value={filters[filter.key] || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                placeholder={filter.placeholder}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterPanel;