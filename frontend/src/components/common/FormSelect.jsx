import React from 'react';
import Icon from './Icon';

const FormSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  required = false, 
  disabled = false,
  className = '',
  placeholder = 'Select an option',
  icon = null,
  error = null
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name={icon} className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            block w-full rounded-md border border-input bg-background text-foreground shadow-sm
            focus:border-ring focus:ring-ring sm:text-sm appearance-none pr-10
            ${icon ? 'pl-10' : 'pl-3'}
            ${disabled ? 'bg-muted/50 cursor-not-allowed text-muted-foreground' : ''}
            ${error ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}
          `}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Right chevron overlay */}
        <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
          <Icon name="chevronDown" className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default FormSelect; 