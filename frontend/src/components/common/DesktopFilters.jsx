const DesktopFilters = ({
  children,
  title = "Filters & Search",
  className = "",
}) => {
  return (
    <div className={`hidden lg:block ${className}`}>
      <div className="card-bg card-border card-shadow rounded-2xl border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          {title}
        </h3>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DesktopFilters; 