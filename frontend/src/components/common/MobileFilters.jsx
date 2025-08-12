import { useState } from 'react';
import Icon from './Icon';

const MobileFilters = ({
  children,
  isOpen = false,
  onToggle,
  className = "",
}) => {
  return (
    <div className={`lg:hidden ${className}`}>
      {/* Mobile Filter Button */}
      <div className="card-bg card-border card-shadow rounded-2xl border overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full p-4 flex items-center justify-between bg-gradient-blue-light hover:bg-gradient-blue-light/80 transition-colors"
        >
          <div className="flex items-center">
            <Icon name="filter" className="w-5 h-5 mr-3 text-gray-600" />
          </div>
          <Icon 
            name={isOpen ? "chevron-up" : "chevron-down"} 
            className="w-5 h-5 text-gray-600 transition-transform duration-200" 
          />
        </button>
        
        {/* Collapsible Filter Content */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200 bg-gradient-slate">
            <div className="space-y-4">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileFilters; 