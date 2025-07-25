import Icon from './Icon';

const FormInput = ({ label, name, value, onChange, type = 'text', required = false, className = '', icon, iconClass = 'text-gray-400', ...rest }) => (
  <div className="mb-2">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>{label}</label>}
    <div className={`relative flex items-center w-full`}>
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
        type={type}
        required={required}
        className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${icon ? 'pl-10' : ''} ${className}`}
        {...rest}
      />
    </div>
  </div>
);

export default FormInput; 