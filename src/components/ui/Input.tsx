import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm text-gray-400 mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 bg-pocket-field border rounded-xl outline-none focus:outline-none text-white placeholder-gray-500 disabled:opacity-50 ${
          error ? 'border-red-500' : 'border-pocket-blue'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default Input;
