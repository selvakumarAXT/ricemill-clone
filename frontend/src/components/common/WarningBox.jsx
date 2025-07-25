import Icon from './Icon';

const WarningBox = ({ children, className = '' }) => (
  <div className={`flex items-center bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded ${className}`} role="alert">
    <Icon name="warning" className="w-6 h-6 mr-2 flex-shrink-0 text-yellow-500" />
    <div>{children}</div>
  </div>
);
export default WarningBox; 