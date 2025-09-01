import React from 'react';
import Icon from './Icon';

const CommonSearchField = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className={`relative w-full max-w-xs ${className}`}>
    <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
      <Icon name="search" className="h-5 w-5 text-muted-foreground" />
    </span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="pl-8 pr-3 py-2 border border-input rounded-md leading-5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:border-ring sm:text-sm w-full"
    />
  </div>
);

export default CommonSearchField; 