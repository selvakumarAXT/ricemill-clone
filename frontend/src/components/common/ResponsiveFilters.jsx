import { useState } from 'react';
import MobileFilters from './MobileFilters';
import DesktopFilters from './DesktopFilters';

const ResponsiveFilters = ({
  children,
  title = "Filters & Search",
  className = "",
}) => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleMobileToggle = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen);
  };

  return (
    <div className={className}>
      {/* Mobile Filters */}
      <MobileFilters
        title={title}
        isOpen={isMobileFiltersOpen}
        onToggle={handleMobileToggle}
      >
        {children}
      </MobileFilters>

      {/* Desktop Filters */}
      <DesktopFilters title={title}>
        {children}
      </DesktopFilters>
    </div>
  );
};

export default ResponsiveFilters; 