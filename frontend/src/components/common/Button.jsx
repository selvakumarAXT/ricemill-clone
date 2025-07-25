import Icon from './Icon';

const VARIANT_CLASSES = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
};

const Button = ({ type = 'button', variant = 'primary', className = '', children, icon, iconClass = 'mr-2', ...rest }) => (
  <button
    type={type}
    className={`px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ${VARIANT_CLASSES[variant] || ''} ${className}`}
    {...rest}
  >
    <span className="flex items-center justify-center">
      {icon && <Icon name={icon} className={iconClass} />}
      {children}
    </span>
  </button>
);

export default Button; 