import React from 'react';
import Icon from './Icon';

const CommonSearchField = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className={`relative w-full max-w-xs ${className}`}>
    <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
      <Icon name="search" className="h-5 w-5 text-gray-400" />
    </span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="pl-8 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm w-full"
    />
  </div>
);

export default CommonSearchField; 