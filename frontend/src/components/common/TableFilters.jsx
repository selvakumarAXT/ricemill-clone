import React from 'react';
import CommonSearchField from './CommonSearchField';

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
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {selectLabel}:
            </label>
          )}
          <select
            value={selectValue}
            onChange={onSelectChange}
            disabled={disabled}
            className={`min-w-[150px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
            }`}
          >
            <option value="">{selectPlaceholder}</option>
            {selectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default TableFilters; 