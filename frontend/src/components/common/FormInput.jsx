import { useState } from 'react';
import Icon from './Icon';

const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  className = '',
  icon,
  iconClass = 'text-muted-foreground',
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const isNumber = type === 'number'; // ✅ ADDED

  return (
    <div className="mb-2">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1" htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <div className={"relative flex items-center w-full"}>
        {icon && (
          <span className="absolute left-0 pl-3 flex items-center h-full pointer-events-none">
            <Icon name={icon} className={`h-5 w-5 ${iconClass}`} />
          </span>
        )}
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          type={inputType}
          required={required}
          className={`block w-full border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-md shadow-sm focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm ${icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} ${className} 
            ${isNumber ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : ''}`} // ✅ ADDED
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-0 pr-3 flex items-center h-full text-muted-foreground hover:text-foreground focus:outline-none"
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