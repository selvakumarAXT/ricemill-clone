import React from 'react';
import ReactApexChart from 'react-apexcharts';

const StackedBarChart = ({
  data = [],
  categories = [],
  series = [],
  title = "Stacked Bar Chart",
  height = 350,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  showLegend = true,
  showDataLabels = false,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  stacked = true,
  horizontal = false,
  className = "",
  chartOptions = {}
}) => {
  // Default data if none provided
  const defaultData = [
    { name: 'Sales', data: [44, 55, 41, 67, 22, 43, 21, 33, 45, 31, 87, 65] },
    { name: 'Purchase', data: [13, 23, 20, 8, 13, 27, 33, 12, 87, 16, 18, 24] },
    { name: 'Production', data: [11, 17, 15, 15, 21, 14, 15, 14, 12, 16, 14, 11] }
  ];

  const defaultCategories = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Use provided data or fall back to defaults
  const chartSeries = series.length > 0 ? series : defaultData;
  const chartCategories = categories.length > 0 ? categories : defaultCategories;

  const options = {
    chart: {
      type: horizontal ? 'bar' : 'bar',
      stacked: stacked,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: horizontal,
        dataLabels: {
          position: 'top'
        },
        borderRadius: 4,
        columnWidth: '70%'
      }
    },
    colors: colors,
    dataLabels: {
      enabled: showDataLabels,
      style: {
        fontSize: '12px',
        colors: ['#fff']
      }
    },
    stroke: {
      width: 1,
      colors: ['#fff']
    },
    series: chartSeries,
    xaxis: {
      categories: chartCategories,
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      },
      axisBorder: {
        show: showXAxis,
        color: '#E5E7EB'
      },
      axisTicks: {
        show: showXAxis,
        color: '#E5E7EB'
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        },
        formatter: function (value) {
          return value.toLocaleString();
        }
      },
      axisBorder: {
        show: showYAxis,
        color: '#E5E7EB'
      },
      axisTicks: {
        show: showYAxis,
        color: '#E5E7EB'
      }
    },
    grid: {
      show: showGrid,
      borderColor: '#E5E7EB',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: showGrid
        }
      },
      yaxis: {
        lines: {
          show: showGrid
        }
      }
    },
    legend: {
      show: showLegend,
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      markers: {
        width: 12,
        height: 12,
        radius: 6
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (value) {
          return value.toLocaleString();
        }
      },
      style: {
        fontSize: '12px'
      }
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '80%'
            }
          }
        }
      },
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '90%'
            }
          },
          legend: {
            position: 'bottom',
            horizontalAlign: 'center'
          }
        }
      }
    ],
    ...chartOptions
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
        )}
        
        <div className="w-full">
          <ReactApexChart
            options={options}
            series={chartSeries}
            type="bar"
            height={height}
          />
        </div>
      </div>
    </div>
  );
};

export default StackedBarChart;
