// src/components/DataTable.jsx
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const DataTable = ({
  columns,
  data,
  keyField = 'id',
  onSort,
  sortBy,
  sortOrder,
  loading = false,
  emptyMessage = "No data found",
  className = ''
}) => {
  const handleSort = (column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`h-3 w-3 ${
                            sortBy === column.key && sortOrder === 'asc'
                              ? 'text-blue-600'
                              : 'text-gray-300'
                          }`}
                        />
                        <ChevronDown
                          className={`h-3 w-3 -mt-1 ${
                            sortBy === column.key && sortOrder === 'desc'
                              ? 'text-blue-600'
                              : 'text-gray-300'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="text-gray-500 text-sm">{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row[keyField]} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;