import React, { useState, useEffect } from 'react';

const LineChart = ({ data = [], title = "Line Chart" }) => {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Default data if none provided
  const chartData = data.length > 0 ? data : [
    { label: 'Jan', value1: 800, value2: 0 },
    { label: 'Feb', value1: 1200, value2: 0 },
    { label: 'Mar', value1: 2800, value2: 0 },
    { label: 'Apr', value1: 1500, value2: 1200 },
    { label: 'May', value1: 2500, value2: 0 },
    { label: 'Jun', value1: 1800, value2: 0 }
  ];

  const maxValue = Math.max(...chartData.map(item => Math.max(item.value1, item.value2)));
  const chartHeight = 200;
  const chartWidth = 400;
  const padding = 40;

  const getY = (value) => {
    return chartHeight - padding - ((value / maxValue) * (chartHeight - 2 * padding));
  };

  const getX = (index) => {
    return padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding);
  };

  // Generate path for line 1
  const line1Path = chartData.map((item, index) => {
    const x = getX(index);
    const y = getY(item.value1);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Generate path for line 2
  const line2Path = chartData.map((item, index) => {
    const x = getX(index);
    const y = getY(item.value2);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Generate area path for line 1
  const area1Path = chartData.map((item, index) => {
    const x = getX(index);
    const y = getY(item.value1);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ') + ` L ${getX(chartData.length - 1)} ${chartHeight - padding} L ${getX(0)} ${chartHeight - padding} Z`;

  return (
    <div className="w-full">
      <div className="relative bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-100 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-indigo-200 transform rotate-12 scale-150" />
        </div>
        
        {/* Chart container */}
        <div className="relative">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
          
          <div className="relative" style={{ width: chartWidth, height: chartHeight }}>
            <svg
              width={chartWidth}
              height={chartHeight}
              className={`transition-all duration-1000 ease-out ${
                isAnimated ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((percent) => (
                <line
                  key={percent}
                  x1={padding}
                  y1={chartHeight - padding - (percent / 100) * (chartHeight - 2 * padding)}
                  x2={chartWidth - padding}
                  y2={chartHeight - padding - (percent / 100) * (chartHeight - 2 * padding)}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  opacity="0.5"
                />
              ))}

              {/* Area fill for line 1 */}
              <path
                d={area1Path}
                fill="url(#areaGradient1)"
                opacity="0.3"
                className="transition-all duration-1000 ease-out"
                style={{
                  transform: isAnimated ? 'scaleY(1)' : 'scaleY(0)',
                  transformOrigin: 'bottom'
                }}
              />

              {/* Line 1 */}
              <path
                d={line1Path}
                stroke="url(#lineGradient1)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))"
                className="transition-all duration-1000 ease-out"
                style={{
                  strokeDasharray: isAnimated ? 'none' : '1000',
                  strokeDashoffset: isAnimated ? '0' : '1000'
                }}
              />

              {/* Line 2 */}
              <path
                d={line2Path}
                stroke="url(#lineGradient2)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="drop-shadow(0 2px 4px rgba(107, 114, 128, 0.3))"
                className="transition-all duration-1000 ease-out"
                style={{
                  strokeDasharray: isAnimated ? 'none' : '1000',
                  strokeDashoffset: isAnimated ? '0' : '1000'
                }}
              />

              {/* Data points for line 1 */}
              {chartData.map((item, index) => (
                item.value1 > 0 && (
                  <circle
                    key={`point1-${index}`}
                    cx={getX(index)}
                    cy={getY(item.value1)}
                    r="5"
                    fill="url(#pointGradient1)"
                    stroke="white"
                    strokeWidth="2"
                    filter="drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4))"
                    className="transition-all duration-1000 ease-out"
                    style={{
                      transform: isAnimated ? 'scale(1)' : 'scale(0)',
                      transitionDelay: `${index * 100}ms`
                    }}
                  />
                )
              ))}

              {/* Data points for line 2 */}
              {chartData.map((item, index) => (
                item.value2 > 0 && (
                  <circle
                    key={`point2-${index}`}
                    cx={getX(index)}
                    cy={getY(item.value2)}
                    r="5"
                    fill="url(#pointGradient2)"
                    stroke="white"
                    strokeWidth="2"
                    filter="drop-shadow(0 2px 4px rgba(107, 114, 128, 0.4))"
                    className="transition-all duration-1000 ease-out"
                    style={{
                      transform: isAnimated ? 'scale(1)' : 'scale(0)',
                      transitionDelay: `${index * 100 + 200}ms`
                    }}
                  />
                )
              ))}

              {/* Gradients */}
              <defs>
                <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6B7280" />
                  <stop offset="100%" stopColor="#4B5563" />
                </linearGradient>
                <linearGradient id="areaGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
                </linearGradient>
                <radialGradient id="pointGradient1" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </radialGradient>
                <radialGradient id="pointGradient2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6B7280" />
                  <stop offset="100%" stopColor="#4B5563" />
                </radialGradient>
              </defs>
            </svg>

            {/* Labels */}
            <div className="flex justify-between mt-4">
              {chartData.map((item, index) => (
                <div
                  key={index}
                  className="text-center transition-all duration-1000 ease-out"
                  style={{
                    transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
                    opacity: isAnimated ? 1 : 0,
                    transitionDelay: `${index * 100 + 400}ms`
                  }}
                >
                  <div className="text-xs text-gray-600 bg-white/70 px-2 py-1 rounded">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2 transition-all duration-1000 ease-out"
                 style={{
                   transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
                   opacity: isAnimated ? 1 : 0,
                   transitionDelay: '600ms'
                 }}>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Sale</span>
            </div>
            <div className="flex items-center space-x-2 transition-all duration-1000 ease-out"
                 style={{
                   transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
                   opacity: isAnimated ? 1 : 0,
                   transitionDelay: '700ms'
                 }}>
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Purchase</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineChart;
