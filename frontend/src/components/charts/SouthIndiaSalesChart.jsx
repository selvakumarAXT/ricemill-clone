import React from 'react';
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

  const options = {
    chart: {
      type: 'bar',
      height: height,
      toolbar: {
        show: true,
        tools: {
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    },
    colors: ['#10B981'], // Single green color for all bars (matching Dashboard)
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return formatCurrency(val);
      },
      style: {
        fontSize: '12px',
        colors: ['#fff']
      }
    },
    stroke: {
      width: 1,
      colors: ['#fff']
    },
    xaxis: {
      categories: stateNames, // Dynamic state names from backend
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '14px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        },
        formatter: function (value) {
          return formatCurrency(value);
        }
      }
    },
    grid: {
      show: true,
      borderColor: '#E5E7EB',
      strokeDashArray: 5
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return formatCurrency(value);
        }
      }
    }
  };

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
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
