import React from 'react';
import CommonSearchField from './CommonSearchField';
import Icon from './Icon';

const TableFilters = ({
  searchValue = '',
  searchPlaceholder = 'Search...',
  onSearchChange,
  selectValue = '',
  selectOptions = [],
  onSelectChange,
  selectPlaceholder = 'All',
  className = '',
  showSearch = true,
  showSelect = true,
  searchLabel = '',
  selectLabel = '',
  disabled = false,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Search Field */}
      {showSearch && (
        <div className="flex-shrink-0">
          <CommonSearchField
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            label={searchLabel}
          />
        </div>
      )}
      
      {/* Select Dropdown */}
      {showSelect && selectOptions.length > 0 && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectLabel && (
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {selectLabel}:
            </label>
          )}
          <div className="relative">
            <select
              value={selectValue}
              onChange={onSelectChange}
              disabled={disabled}
              className={`min-w-[150px] px-3 py-2 border border-input rounded-md shadow-sm bg-background text-foreground focus:ring-ring focus:border-ring sm:text-sm appearance-none pr-8 ${
                disabled ? 'bg-muted cursor-not-allowed opacity-60' : ''
              }`}
            >
              <option value="">{selectPlaceholder}</option>
              {selectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 pr-2 flex items-center">
              <Icon name="chevronDown" className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableFilters; 