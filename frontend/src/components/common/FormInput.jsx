import { useState } from 'react';
import Icon from './Icon';

const FormInput = ({ label, name, value, onChange, type = 'text', required = false, className = '', icon, iconClass = 'text-gray-400', readOnly = false, ...rest }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor={name}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name={icon} className={`h-5 w-5 ${iconClass}`} />
          </div>
        )}
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          type={inputType}
          required={required}
          readOnly={readOnly}
          className={`
            block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm 
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''} 
            ${isPassword ? 'pr-10' : ''} 
            ${readOnly ? 'bg-gray-50 text-gray-700' : 'bg-white'} 
            ${className}
          `}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => setShowPassword((v) => !v)}
          >
            <Icon name={showPassword ? 'eyeOff' : 'eye'} className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FormInput; 