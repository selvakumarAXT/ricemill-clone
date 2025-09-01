import React from 'react';

const OutstandingProgressBar = ({
  title = "Outstanding Balances",
  data = {},
  total = 0,
  className = "",
  colors = {
    // Use theme tokens for a consistent palette
    current: 'bg-primary',
    overdue_1_15: 'bg-accent',
    overdue_16_30: 'bg-secondary',
    overdue_30_plus: 'bg-destructive'
  },
  labels = {
    overdue_1_15: '1-15 Days',
    overdue_16_30: '16-30 Days',
    overdue_30_plus: '30+ Days'
  }
}) => {
  // Calculate percentages for each segment
  const getPercentage = (value) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  // Format currency (you can pass a custom formatter)
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={`rounded-lg border bg-card text-card-foreground p-6 shadow-sm ${className}`}>
      {/* Title */}
      {title && (
        <h3 className="text-md font-semibold text-muted-foreground mb-4">{title}</h3>
      )}
      
      {/* Total Amount Above */}
      <div className="text-start mb-4">
        <div className="text-md font-normal text-muted-foreground">
          {title==='Sales Outstanding'?"Total Receivables": 'Total Payables'} :{formatAmount(total)}
        </div>
      </div>

      {/* Custom Horizontal Bar */}
      <div className={`w-full h-4 bg-muted rounded-md overflow-hidden mb-4`}>
        <div className="flex h-full">
          {/* Current */}
          <div 
            className={`h-full ${colors.current} flex items-center justify-center text-primary-foreground text-[10px] font-medium transition-all duration-300 relative group cursor-pointer`}
            style={{ width: `${getPercentage(data.current || 0)}%` }}
            title={`Current: ${formatAmount(data.current || 0)}`}
          >
            
          </div>
          
          {/* 1-15 Days Overdue */}
          <div 
            className={`h-full ${colors.overdue_1_15} flex items-center justify-center text-accent-foreground text-[10px] font-medium transition-all duration-300 relative group cursor-pointer`}
            style={{ width: `${getPercentage(data.overdue_1_15 || 0)}%` }}
            title={`1-15 Days Overdue: ${formatAmount(data.overdue_1_15 || 0)}`}
          >
            
         
          </div>
          
          {/* 16-30 Days Overdue */}
          <div 
            className={`h-full ${colors.overdue_16_30} flex items-center justify-center text-secondary-foreground text-[10px] font-medium transition-all duration-300 relative group cursor-pointer`}
            style={{ width: `${getPercentage(data.overdue_16_30 || 0)}%` }}
            title={`16-30 Days Overdue: ${formatAmount(data.overdue_16_30 || 0)}`}
          >
          </div>
          
          {/* 30+ Days Overdue */}
          <div 
            className={`h-full ${colors.overdue_30_plus} flex items-center justify-center text-destructive-foreground text-[10px] font-medium transition-all duration-300 relative group cursor-pointer`}
            style={{ width: `${getPercentage(data.overdue_30_plus || 0)}%` }}
            title={`30+ Days Overdue: ${formatAmount(data.overdue_30_plus || 0)}`}
          >
            
         
          </div>
        </div>
      </div>

            {/* Labels Below */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex flex-col items-center space-y-1">
          <span className="text-foreground font-medium">Current</span>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 ${colors.current} rounded-sm`}></div>
            <span className="font-medium">{formatAmount(data.current || 0)}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-1">
        <span className="text-foreground font-medium">Over Due</span>

          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 ${colors.overdue_1_15} rounded-sm`}></div>
            <span className="font-medium">{formatAmount(data.overdue_1_15 || 0)}</span>
          </div>
          <span className="text-muted-foreground font-medium">{labels.overdue_1_15}</span>

        </div>
        
        <div className="flex flex-col items-center space-y-1">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 ${colors.overdue_16_30} rounded-sm`}></div>
            <span className="font-medium">{formatAmount(data.overdue_16_30 || 0)}</span>
          </div>
          <span className="text-muted-foreground font-medium">{labels.overdue_16_30}</span>

        </div>
        
        <div className="flex flex-col items-center space-y-1">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 ${colors.overdue_30_plus} rounded-sm`}></div>
            <span className="font-medium">{formatAmount(data.overdue_30_plus || 0)}</span>

          </div>
          <span className="text-muted-foreground font-medium">{labels.overdue_30_plus}</span>

        </div>
      </div>
    </div>
  );
};

export default OutstandingProgressBar;
