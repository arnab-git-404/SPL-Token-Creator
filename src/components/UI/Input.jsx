import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  name,
  error = '',
  required = false,
  min,
  max,
  step,
  disabled = false
}) => {
  return (
    <div className="mb-4  py-2  border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9945FF] ">
      
      {label && (
        <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor={name}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        id={name}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`input w-full  text-gray-800 ${error ? 'border-red-500' : 'border-gray-300'}`}
      />

      <style jsx>{`
        .input {
          border: 1px solid #1f2937;
          border-radius: 0.375rem;
          padding: 0.5rem 1rem;
          width: 100%;
          outline: none;
        }
        .input:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(153, 69, 255, 0.5);
          border-color: #9945FF;
        }
        .input.error {
          border-color: #ef4444;
        }
        .input:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }
      `}</style>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;