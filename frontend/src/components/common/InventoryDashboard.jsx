import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import Icon from './Icon';

const InventoryDashboard = ({ inventoryData, loading }) => {
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
      gunny: {
        total: 0,
        NB: 0,
        ONB: 0,
        SS: 0,
        SWP: 0,
        unit: 'bags'
      },
      paddy: {
        total: 0,
        varieties: {},
        unit: 'kg'
      },
      rice: {
        total: 0,
        varieties: {},
        unit: 'kg'
      }
    };

    inventoryData.forEach(item => {
      if (item.category === 'gunny') {
        totals.gunny.total += item.quantity || 0;
        if (item.gunnyType) {
          totals.gunny[item.gunnyType] += item.quantity || 0;
        }
      } else if (item.category === 'paddy') {
        totals.paddy.total += item.quantity || 0;
        if (item.paddyVariety) {
          totals.paddy.varieties[item.paddyVariety] = (totals.paddy.varieties[item.paddyVariety] || 0) + (item.quantity || 0);
        }
      } else if (item.category === 'rice') {
        totals.rice.total += item.quantity || 0;
        if (item.riceVariety) {
          totals.rice.varieties[item.riceVariety] = (totals.rice.varieties[item.riceVariety] || 0) + (item.quantity || 0);
        }
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

  // Get trending indicator
  const getTrendingIcon = (current, previous) => {
    if (current > previous) {
      return <Icon name="trendingUp" className="w-4 h-4 text-green-500" />;
    } else if (current < previous) {
      return <Icon name="trendingDown" className="w-4 h-4 text-red-500" />;
    }
    return <Icon name="barChart" className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gunny Summary Card */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-orange-800">
              <Icon name="package" className="w-5 h-5 mr-2" />
              Total Gunny
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 mb-2">
              {formatQuantity(totals.gunny.total, totals.gunny.unit)}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                  NB: {totals.gunny.NB.toLocaleString()}
                </Badge>
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                  ONB: {totals.gunny.ONB.toLocaleString()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                  SS: {totals.gunny.SS.toLocaleString()}
                </Badge>
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                  SWP: {totals.gunny.SWP.toLocaleString()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paddy Summary Card */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-green-800">
              <Icon name="wheat" className="w-5 h-5 mr-2" />
              Total Paddy
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

        {/* Rice Summary Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-blue-800">
              <Icon name="rice" className="w-5 h-5 mr-2" />
              Total Rice
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
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gunny Detailed Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <Icon name="box" className="w-5 h-5 mr-2" />
              Gunny Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['NB', 'ONB', 'SS', 'SWP'].map((type) => (
                <div key={type} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span className="font-medium text-orange-900">{type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-900">
                      {totals.gunny[type].toLocaleString()} Bags
                    </div>
                    <div className="text-sm text-orange-600">
                      {totals.gunny.total > 0 ? ((totals.gunny[type] / totals.gunny.total) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Paddy & Rice Varieties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Icon name="scale" className="w-5 h-5 mr-2" />
              Varieties Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Paddy Varieties */}
              <div>
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                  <Icon name="wheat" className="w-4 h-4 mr-2" />
                  Paddy Varieties
                </h4>
                <div className="space-y-2">
                  {Object.entries(totals.paddy.varieties).map(([variety, quantity]) => (
                    <div key={variety} className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium text-green-800">{variety}</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        {formatQuantity(quantity, totals.paddy.unit)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rice Varieties */}
              <div>
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                  <Icon name="rice" className="w-4 h-4 mr-2" />
                  Rice Varieties
                </h4>
                <div className="space-y-2">
                  {Object.entries(totals.rice.varieties).map(([variety, quantity]) => (
                    <div key={variety} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <span className="text-sm font-medium text-blue-800">{variety}</span>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                        {formatQuantity(quantity, totals.rice.unit)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Icon name="barChart" className="w-5 h-5 mr-2" />
            Quick Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{inventoryData.length}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">
                {inventoryData.filter(item => item.category === 'gunny').length}
              </div>
              <div className="text-sm text-orange-600">Gunny Items</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {inventoryData.filter(item => item.category === 'paddy').length}
              </div>
              <div className="text-sm text-green-600">Paddy Items</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {inventoryData.filter(item => item.category === 'rice').length}
              </div>
              <div className="text-sm text-blue-600">Rice Items</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;
