import Icon from './Icon';

const FormSelect = ({ label, name, value, onChange, required = false, className = '', children, icon, iconClass = 'text-[var(--color-text-gray-light)]', ...rest }) => (
  <div className="mb-2">
    {label && (
      <label className="block text-sm font-medium text-[var(--color-text-gray-dark)] mb-1" htmlFor={name}>
        {label}
        {required && <span className="text-[var(--color-text-red)] ml-0.5">*</span>}
      </label>
    )}
    <div className={`relative flex items-center w-full`}>
      {icon && (
        <span className="absolute left-0 pl-3 flex items-center h-full pointer-events-none">
          <Icon name={icon} className={`h-5 w-5 ${iconClass}`} />
        </span>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`block w-full border-[var(--color-border-gray)] rounded-md shadow-sm focus:ring-2 focus:ring-[var(--color-bg-accent)] focus:border-[var(--color-bg-accent)] sm:text-sm ${icon ? 'pl-10' : ''} ${className}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  </div>
);
export default FormSelect; 