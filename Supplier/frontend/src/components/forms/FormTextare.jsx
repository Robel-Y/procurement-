// src/components/forms/FormTextarea.jsx
import React from 'react';

const FormTextarea = ({
  label,
  error,
  register,
  name,
  required = false,
  placeholder,
  rows = 4,
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
      
      <textarea
        id={name}
        rows={rows}
        {...register(name, { required: required && `${label} is required` })}
        className={`
          w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
        placeholder={placeholder}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default FormTextarea;