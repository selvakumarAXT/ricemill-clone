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
    <div className={`flex flex-col lg:flex-row gap-4 ${className}`}>
      <div className="min-w-[180px] flex-shrink-0">
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
      </div>
      <div className="min-w-[180px] flex-shrink-0">
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
    </div>
  );
};

export default DateRangeFilter; 