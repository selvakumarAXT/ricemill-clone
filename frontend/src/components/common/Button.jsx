import Icon from './Icon';

  const VARIANT_CLASSES = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
    info: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2',
    purple: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
    indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
    outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  };

const Button = ({ type = 'button', variant = 'primary', className = '', children, icon, iconClass = 'mr-2', ...rest }) => (
  <button
    type={type}
    className={`px-4 py-2 rounded outline-none font-medium focus:outline-none transition ${VARIANT_CLASSES[variant] || ''} ${className}`}
    {...rest}
  >
    <span className="flex items-center justify-center">
      {icon && <Icon name={icon} className={iconClass} />}
      {children}
    </span>
  </button>
);

export default Button; 