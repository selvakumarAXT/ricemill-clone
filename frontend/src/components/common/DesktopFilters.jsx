const DesktopFilters = ({
  children,
  className = "",
}) => {
  return (
    <div className={`hidden lg:block ${className}`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {children}
        </div>
    </div>
  );
};

export default DesktopFilters; 