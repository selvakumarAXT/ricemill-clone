import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

const CreatableSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select or type to create...",
  required = false,
  disabled = false,
  className = "",
  allowCreate = true,
  maxLength = 50,
  onOptionCreate = null, // Callback when new option is created
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter options based on input value
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option => 
        option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        option.value.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [inputValue, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsCreating(false);
        setInputValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle option selection
  const handleOptionSelect = (option) => {
    onChange({
      target: {
        name,
        value: option.value
      }
    });
    setIsOpen(false);
    setIsCreating(false);
    setInputValue('');
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Check if we should show create option
    const exactMatch = options.some(option => 
      option.value.toLowerCase() === value.toLowerCase() ||
      option.label.toLowerCase() === value.toLowerCase()
    );
    
    setIsCreating(allowCreate && value.trim() !== '' && !exactMatch);
  };

  // Handle create new option
  const handleCreateOption = () => {
    const newValue = inputValue.trim();
    if (newValue && allowCreate) {
      const newOption = {
        value: newValue,
        label: newValue
      };
      
      // Call callback if provided
      if (onOptionCreate) {
        onOptionCreate(newOption);
      }
      
      // Select the new option
      handleOptionSelect(newOption);
    }
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isCreating) {
        handleCreateOption();
      } else if (filteredOptions.length > 0) {
        handleOptionSelect(filteredOptions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setIsCreating(false);
      setInputValue('');
    }
  };

  // Get display value
  const getDisplayValue = () => {
    if (value) {
      const selectedOption = options.find(option => option.value === value);
      return selectedOption ? selectedOption.label : value;
    }
    return '';
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        <div
          className={`relative cursor-pointer border rounded-md shadow-sm
            border-input bg-background text-foreground
            ${disabled ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'hover:bg-muted/50'}
            focus-within:ring-2 focus-within:ring-ring focus-within:border-ring`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex-1 min-w-0">
              {isOpen ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  className="w-full border-none outline-none bg-transparent text-sm placeholder:text-muted-foreground"
                  autoFocus
                />
              ) : (
                <span className={`block truncate text-sm ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {getDisplayValue() || placeholder}
                </span>
              )}
            </div>
            <Icon
              name={isOpen ? "chevronUp" : "chevronDown"}
              className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2"
            />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-popover text-foreground border border-border rounded-md shadow-lg max-h-60 overflow-auto">
            {/* Existing options */}
            {filteredOptions.map((option, index) => (
              <div
                key={option.value}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-muted flex items-center"
                onClick={() => handleOptionSelect(option)}
              >
                <span className="flex-1">{option.label}</span>
                {option.value === value && (
                  <Icon name="check" className="w-4 h-4 text-primary" />
                )}
              </div>
            ))}
            
            {/* Create new option */}
            {isCreating && (
              <div
                className="px-3 py-2 text-sm cursor-pointer bg-primary/10 hover:bg-primary/20 border-t border-border flex items-center"
                onClick={handleCreateOption}
              >
                <Icon name="add" className="w-4 h-4 text-primary mr-2" />
                <span className="text-primary">
                  Create "{inputValue}"
                </span>
              </div>
            )}
            
            {/* No options message */}
            {filteredOptions.length === 0 && !isCreating && inputValue && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No options found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatableSelect; 