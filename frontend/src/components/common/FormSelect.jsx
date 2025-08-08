import Icon from './Icon';

const FormSelect = ({ label, name, value, onChange, required = false, className = '', children, options = [], icon, iconClass = 'text-gray-400', ...rest }) => (
  <div className="w-full space-y-2">
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`
          block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm 
          bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${icon ? 'pl-10' : ''} 
          ${className}
        `}
        {...rest}
      >
        {options.length > 0 ? (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
    </div>
  </div>
);
export default FormSelect; 