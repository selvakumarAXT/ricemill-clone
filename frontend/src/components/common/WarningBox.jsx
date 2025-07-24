const WarningBox = ({ children, className = '' }) => (
  <div className={`flex items-center bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded ${className}`} role="alert">
    <svg className="w-6 h-6 mr-2 flex-shrink-0 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
    </svg>
    <div>{children}</div>
  </div>
);
export default WarningBox; 