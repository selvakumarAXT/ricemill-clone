import React from 'react';
import FormInput from './FormInput';

const DateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startDateLabel = "Start Date",
  endDateLabel = "End Date",
  className = "",
  disabled = false,
  required = false
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <FormInput
        label={startDateLabel}
        name="startDate"
        type="date"
        value={startDate}
        onChange={onStartDateChange}
        disabled={disabled}
        required={required}
        icon="calendar"
      />
      <FormInput
        label={endDateLabel}
        name="endDate"
        type="date"
        value={endDate}
        onChange={onEndDateChange}
        disabled={disabled}
        required={required}
        icon="calendar"
      />
    </div>
  );
};

export default DateRangeFilter; 