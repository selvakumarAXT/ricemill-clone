import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import Icon from './Icon';

const ProductionDashboard = ({ productionData, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate totals and breakdowns
  const calculateTotals = () => {
    const totals = {
      rice: {
        total: 0,
        varieties: {},
        unit: 'kg'
      },
      paddy: {
        total: 0,
        varieties: {},
        unit: 'kg'
      },
      byproduct: {
        total: 0,
        types: {},
        unit: 'kg'
      },
      productionTypes: {
        milling: 0,
        processing: 0,
        packaging: 0,
        quality_check: 0,
        storage: 0,
        other: 0
      },
      status: {
        Pending: 0,
        'In Progress': 0,
        Completed: 0,
        Cancelled: 0
      },
      quality: {
        Excellent: 0,
        Good: 0,
        Average: 0,
        Poor: 0
      },
      efficiency: {
        total: 0,
        count: 0,
        excellent: 0,
        good: 0,
        average: 0,
        poor: 0
      }
    };

    productionData.forEach(item => {
      // Category totals
      if (item.category === 'rice') {
        totals.rice.total += item.quantity || 0;
        if (item.riceVariety) {
          totals.rice.varieties[item.riceVariety] = (totals.rice.varieties[item.riceVariety] || 0) + (item.quantity || 0);
        }
      } else if (item.category === 'paddy') {
        totals.paddy.total += item.quantity || 0;
        if (item.paddyVariety) {
          totals.paddy.varieties[item.paddyVariety] = (totals.paddy.varieties[item.paddyVariety] || 0) + (item.quantity || 0);
        }
      } else if (item.category === 'byproduct') {
        totals.byproduct.total += item.quantity || 0;
        if (item.byproductType) {
          totals.byproduct.types[item.byproductType] = (totals.byproduct.types[item.byproductType] || 0) + (item.quantity || 0);
        }
      }

      // Production type totals
      if (item.productionType) {
        totals.productionTypes[item.productionType] += item.quantity || 0;
      }

      // Status totals
      if (item.status) {
        totals.status[item.status]++;
      }

      // Quality totals
      if (item.quality) {
        totals.quality[item.quality]++;
      }

      // Efficiency totals
      if (item.efficiency) {
        totals.efficiency.total += item.efficiency;
        totals.efficiency.count++;
        
        if (item.efficiency >= 90) totals.efficiency.excellent++;
        else if (item.efficiency >= 80) totals.efficiency.good++;
        else if (item.efficiency >= 70) totals.efficiency.average++;
        else totals.efficiency.poor++;
      }
    });

    return totals;
  };

  const totals = calculateTotals();

  // Format quantities with proper units
  const formatQuantity = (quantity, unit) => {
    if (unit === 'kg') {
      if (quantity >= 1000) {
        return `${(quantity / 1000).toFixed(2)} Tons (${quantity.toLocaleString()} KG)`;
      }
      return `${quantity.toLocaleString()} KG`;
    } else if (unit === 'bags') {
      return `${quantity.toLocaleString()} Bags`;
    }
    return `${quantity.toLocaleString()} ${unit}`;
  };

  // Calculate average efficiency
  const averageEfficiency = totals.efficiency.count > 0 
    ? (totals.efficiency.total / totals.efficiency.count).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Rice Production Summary Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-blue-800">
              <Icon name="rice" className="w-5 h-5 mr-2" />
              Rice Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-2">
              {formatQuantity(totals.rice.total, totals.rice.unit)}
            </div>
            <div className="space-y-2">
              {Object.entries(totals.rice.varieties).slice(0, 3).map(([variety, quantity]) => (
                <div key={variety} className="flex justify-between items-center text-sm">
                  <span className="text-blue-700 font-medium">{variety}</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    {formatQuantity(quantity, totals.rice.unit)}
                  </Badge>
                </div>
              ))}
              {Object.keys(totals.rice.varieties).length > 3 && (
                <div className="text-xs text-blue-600 text-center">
                  +{Object.keys(totals.rice.varieties).length - 3} more varieties
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Paddy Processing Summary Card */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-green-800">
              <Icon name="wheat" className="w-5 h-5 mr-2" />
              Paddy Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 mb-2">
              {formatQuantity(totals.paddy.total, totals.paddy.unit)}
            </div>
            <div className="space-y-2">
              {Object.entries(totals.paddy.varieties).slice(0, 3).map(([variety, quantity]) => (
                <div key={variety} className="flex justify-between items-center text-sm">
                  <span className="text-green-700 font-medium">{variety}</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {formatQuantity(quantity, totals.paddy.unit)}
                  </Badge>
                </div>
              ))}
              {Object.keys(totals.paddy.varieties).length > 3 && (
                <div className="text-xs text-green-600 text-center">
                  +{Object.keys(totals.paddy.varieties).length - 3} more varieties
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Byproduct Summary Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-purple-800">
              <Icon name="package" className="w-5 h-5 mr-2" />
              Byproducts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-2">
              {formatQuantity(totals.byproduct.total, totals.byproduct.unit)}
            </div>
            <div className="space-y-2">
              {Object.entries(totals.byproduct.types).slice(0, 3).map(([type, quantity]) => (
                <div key={type} className="flex justify-between items-center text-sm">
                  <span className="text-purple-700 font-medium capitalize">{type.replace('_', ' ')}</span>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    {formatQuantity(quantity, totals.byproduct.unit)}
                  </Badge>
                </div>
              ))}
              {Object.keys(totals.byproduct.types).length > 3 && (
                <div className="text-xs text-purple-600 text-center">
                  +{Object.keys(totals.byproduct.types).length - 3} more types
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Types Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Icon name="mill" className="w-5 h-5 mr-2" />
              Production Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(totals.productionTypes).map(([type, quantity]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900 capitalize">{type.replace('_', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatQuantity(quantity, 'kg')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status & Quality Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Icon name="quality" className="w-5 h-5 mr-2" />
              Status & Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Production Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(totals.status).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">{status}</span>
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Quality Distribution</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(totals.quality).map(([quality, count]) => (
                    <div key={quality} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">{quality}</span>
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency & Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Icon name="barChart" className="w-5 h-5 mr-2" />
            Efficiency & Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Efficiency */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-900">{averageEfficiency}%</div>
              <div className="text-sm text-blue-600">Average Efficiency</div>
              <div className="text-xs text-blue-500 mt-1">Based on {totals.efficiency.count} records</div>
            </div>

            {/* Efficiency Distribution */}
            <div className="col-span-2">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Efficiency Distribution</h4>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-900">{totals.efficiency.excellent}</div>
                  <div className="text-xs text-green-600">Excellent (90%+)</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-900">{totals.efficiency.good}</div>
                  <div className="text-xs text-blue-600">Good (80-89%)</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-xl font-bold text-yellow-900">{totals.efficiency.average}</div>
                  <div className="text-xs text-yellow-600">Average (70-79%)</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-xl font-bold text-red-900">{totals.efficiency.poor}</div>
                  <div className="text-xs text-red-600">Poor (&lt;70%)</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Icon name="barChart" className="w-5 h-5 mr-2" />
            Quick Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{productionData.length}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {productionData.filter(item => item.category === 'rice').length}
              </div>
              <div className="text-sm text-blue-600">Rice Production</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {productionData.filter(item => item.category === 'paddy').length}
              </div>
              <div className="text-sm text-green-600">Paddy Processing</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">
                {productionData.filter(item => item.category === 'byproduct').length}
              </div>
              <div className="text-sm text-purple-600">Byproducts</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">
                {productionData.filter(item => item.status === 'Completed').length}
              </div>
              <div className="text-sm text-orange-600">Completed</div>
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-900">
                {productionData.filter(item => item.status === 'In Progress').length}
              </div>
              <div className="text-sm text-indigo-600">In Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionDashboard;
