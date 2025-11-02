// src/components/forms/FormSelect.jsx
import React from 'react';

const FormSelect = ({
  label,
  error,
  register,
  name,
  required = false,
  options = [],
  placeholder,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <select
        id={name}
        {...register(name, { required: required && `${label} is required` })}
        className={`
          w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default FormSelect;