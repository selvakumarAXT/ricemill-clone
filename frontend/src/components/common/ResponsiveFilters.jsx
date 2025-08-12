import { useState } from "react";
import MobileFilters from "./MobileFilters";
import DesktopFilters from "./DesktopFilters";

const ResponsiveFilters = ({
  children,
  className = "",
}) => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleMobileToggle = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen);
  };

  return (
    <div className={className}>
      {/* Mobile Filters */}
      <MobileFilters isOpen={isMobileFiltersOpen} onToggle={handleMobileToggle}>
        {children}
      </MobileFilters>

      {/* Desktop Filters */}
      <DesktopFilters>{children}</DesktopFilters>
    </div>
  );
};

export default ResponsiveFilters;
