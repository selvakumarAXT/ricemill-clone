import React, { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const SouthIndiaSalesChart = ({ 
  data = {}, 
  title = "Sales Overview",
  height = 300,
  className = ""
}) => {
  // Format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Resolve CSS variable hsl values to usable CSS color strings
  const resolveVar = (name) => {
    if (typeof window === 'undefined') return undefined;
    const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return val ? `hsl(${val})` : undefined;
  };

  // Track theme changes to recompute colors when .dark class toggles
  const [themeVersion, setThemeVersion] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new MutationObserver(() => setThemeVersion((v) => v + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Extract sales data for ALL states from backend (dynamic)
  const allStatesData = Object.entries(data?.stateSales || {}).map(([state, sales]) => ({
    state,
    sales: sales || 0
  }));

  // Sort by sales amount (highest first) and get top states
  const sortedStatesData = allStatesData
    .sort((a, b) => b.sales - a.sales)  
    .slice(0, 10); // Show top 10 states

  const stateNames = sortedStatesData.map(item => item.state);
  const salesData = sortedStatesData.map(item => item.sales);

  const options = useMemo(() => {
    const primary = resolveVar('--primary') || '#10b981';
    const border = resolveVar('--border') || '#e5e7eb';
    const mutedFg = resolveVar('--muted-foreground') || '#6b7280';
    const primaryFg = resolveVar('--primary-foreground') || '#ffffff';

    return {
      chart: {
        type: 'bar',
        height: height,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4,
          dataLabels: {
            position: 'top',
          },
        },
      },
      colors: [primary],
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return formatCurrency(val);
        },
        style: {
          fontSize: '12px',
          colors: [primaryFg],
        },
      },
      stroke: {
        width: 1,
        colors: [border],
      },
      xaxis: {
        categories: stateNames, // Dynamic state names from backend
        labels: {
          style: {
            colors: mutedFg,
            fontSize: '12px',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: mutedFg,
            fontSize: '12px',
          },
          formatter: function (value) {
            return formatCurrency(value);
          },
        },
      },
      grid: {
        show: true,
        borderColor: border,
        strokeDashArray: 5,
      },
      tooltip: {
        y: {
          formatter: function (value) {
            return formatCurrency(value);
          },
        },
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, stateNames.join(','), themeVersion]);

  return (
    <div className={`rounded-lg border bg-card text-card-foreground p-6 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-muted-foreground mb-4">{title}</h3>
      <ReactApexChart
        options={options}
        series={[
          {
            name: 'Sales',
            data: salesData
          }
        ]}
        type="bar"
        height={height}
      />
    </div>
  );
};

export default SouthIndiaSalesChart;
