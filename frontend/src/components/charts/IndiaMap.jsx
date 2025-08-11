import React from 'react';
import ReactApexChart from 'react-apexcharts';

const IndiaMap = ({ data = {} }) => {
  // India map data with states
  const mapData = [
    { name: 'Andhra Pradesh', value: data.stateSales?.['Andhra Pradesh'] || 0 },
    { name: 'Arunachal Pradesh', value: data.stateSales?.['Arunachal Pradesh'] || 0 },
    { name: 'Assam', value: data.stateSales?.['Assam'] || 0 },
    { name: 'Bihar', value: data.stateSales?.['Bihar'] || 0 },
    { name: 'Chhattisgarh', value: data.stateSales?.['Chhattisgarh'] || 0 },
    { name: 'Goa', value: data.stateSales?.['Goa'] || 0 },
    { name: 'Gujarat', value: data.stateSales?.['Gujarat'] || 0 },
    { name: 'Haryana', value: data.stateSales?.['Haryana'] || 0 },
    { name: 'Himachal Pradesh', value: data.stateSales?.['Himachal Pradesh'] || 0 },
    { name: 'Jharkhand', value: data.stateSales?.['Jharkhand'] || 0 },
    { name: 'Karnataka', value: data.stateSales?.['Karnataka'] || 0 },
    { name: 'Kerala', value: data.stateSales?.['Kerala'] || 0 },
    { name: 'Madhya Pradesh', value: data.stateSales?.['Madhya Pradesh'] || 0 },
    { name: 'Maharashtra', value: data.stateSales?.['Maharashtra'] || 0 },
    { name: 'Manipur', value: data.stateSales?.['Manipur'] || 0 },
    { name: 'Meghalaya', value: data.stateSales?.['Meghalaya'] || 0 },
    { name: 'Mizoram', value: data.stateSales?.['Mizoram'] || 0 },
    { name: 'Nagaland', value: data.stateSales?.['Nagaland'] || 0 },
    { name: 'Odisha', value: data.stateSales?.['Odisha'] || 0 },
    { name: 'Punjab', value: data.stateSales?.['Punjab'] || 0 },
    { name: 'Rajasthan', value: data.stateSales?.['Rajasthan'] || 0 },
    { name: 'Sikkim', value: data.stateSales?.['Sikkim'] || 0 },
    { name: 'Tamil Nadu', value: data.stateSales?.['Tamil Nadu'] || 0 },
    { name: 'Telangana', value: data.stateSales?.['Telangana'] || 0 },
    { name: 'Tripura', value: data.stateSales?.['Tripura'] || 0 },
    { name: 'Uttar Pradesh', value: data.stateSales?.['Uttar Pradesh'] || 0 },
    { name: 'Uttarakhand', value: data.stateSales?.['Uttarakhand'] || 0 },
    { name: 'West Bengal', value: data.stateSales?.['West Bengal'] || 0 },
    { name: 'Delhi', value: data.stateSales?.['Delhi'] || 0 },
    { name: 'Jammu and Kashmir', value: data.stateSales?.['Jammu and Kashmir'] || 0 },
    { name: 'Ladakh', value: data.stateSales?.['Ladakh'] || 0 },
    { name: 'Chandigarh', value: data.stateSales?.['Chandigarh'] || 0 },
    { name: 'Dadra and Nagar Haveli and Daman and Diu', value: data.stateSales?.['Dadra and Nagar Haveli and Daman and Diu'] || 0 },
    { name: 'Lakshadweep', value: data.stateSales?.['Lakshadweep'] || 0 },
    { name: 'Puducherry', value: data.stateSales?.['Puducherry'] || 0 },
    { name: 'Andaman and Nicobar Islands', value: data.stateSales?.['Andaman and Nicobar Islands'] || 0 }
  ];

  const options = {
    chart: {
      type: 'map',
      height: 400,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    title: {
      text: 'Sales by State',
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    colors: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        const value = opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex];
        if (value > 0) {
          return opts.w.globals.labels[opts.dataPointIndex];
        }
        return '';
      },
      style: {
        fontSize: '10px',
        fontWeight: 'bold'
      }
    },
    legend: {
      show: true,
      position: 'right',
      horizontalAlign: 'right',
      labels: {
        colors: '#6B7280'
      }
    },
    tooltip: {
      enabled: true,
      formatter: function({ series, seriesIndex, dataPointIndex, w }) {
        const stateName = w.globals.labels[dataPointIndex];
        const value = series[seriesIndex][dataPointIndex];
        if (value > 0) {
          return `<div><strong>${stateName}</strong><br/>Sales: ₹${(value / 100000).toFixed(2)} Lakhs</div>`;
        }
        return `<div><strong>${stateName}</strong><br/>No Sales</div>`;
      }
    },
    plotOptions: {
      map: {
        states: {
          hover: {
            color: '#10B981'
          }
        }
      }
    },
    series: [
      {
        name: 'Sales',
        data: mapData
      }
    ]
  };

  // If no map data available, show placeholder
  if (!data.stateSales || Object.keys(data.stateSales).length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">India Map Visualization</h3>
          <p className="text-gray-500">Geographical sales data will appear here</p>
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-4 mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-teal-500 rounded"></div>
                <span>Sales</span>
              </div>
              <span>0 - 1.25 Cr</span>
            </div>
            <div>
              <strong>Top Sale State:</strong> {data.topState || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ReactApexChart
        options={options}
        series={options.series}
        type="map"
        height={400}
      />
      <div className="mt-4 text-center text-sm text-gray-600">
        <div className="flex items-center justify-center space-x-4 mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-teal-500 rounded"></div>
            <span>Sales</span>
          </div>
          <span>0 - {(Math.max(...Object.values(data.stateSales)) / 10000000).toFixed(2)} Cr</span>
        </div>
        <div>
          <strong>Top Sale State:</strong> {data.topState || 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default IndiaMap;
