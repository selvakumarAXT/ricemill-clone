import Icon from './Icon';

  const VARIANT_CLASSES = {
    primary: 'bg-[var(--color-bg-primary)] text-[var(--color-text-white)] hover:bg-[var(--color-bg-accent)]',
    secondary: ' bg-[var(--color-text-gray-light)] text-[var(--color-text-white)] hover:bg-[var(--color-bg-light)]  hover:text-[var(--color-text-gray-dark)]',
    danger: 'bg-[var(--color-text-red)] text-[var(--color-text-white)] hover:bg-[var(--color-bg-light)] hover:text-[var(--color-text-dark)]',
    outline: 'bg-[var(--color-bg-white)] border border-[var(--color-border-gray)] text-[var(--color-text-gray-dark)] hover:bg-[var(--color-bg-light)]',
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