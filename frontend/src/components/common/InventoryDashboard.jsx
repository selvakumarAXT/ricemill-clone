import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import Icon from './Icon';

const InventoryDashboard = ({ inventoryData, loading }) => {
  if (loading) {
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-6 xl:grid-cols-12">
        <div className="col-span-1 md:col-span-6 xl:col-span-8 row-span-2 h-[220px] rounded-lg bg-muted border border-border animate-pulse" />
        <div className="col-span-1 md:col-span-3 xl:col-span-4 row-span-2 h-[220px] rounded-lg bg-muted border border-border animate-pulse" />
        <div className="col-span-1 md:col-span-3 xl:col-span-6 h-[160px] rounded-lg bg-muted border border-border animate-pulse" />
        <div className="col-span-1 md:col-span-3 xl:col-span-6 h-[160px] rounded-lg bg-muted border border-border animate-pulse" />
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

    if (!Array.isArray(inventoryData)) return totals;
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

  const getTopEntries = (obj, limit = 5) =>
    Object.entries(obj || {})
      .sort((a, b) => (b[1] || 0) - (a[1] || 0))
      .slice(0, limit);

  const getPercent = (value, total) => (total > 0 ? Math.round((value / total) * 100) : 0);

  const totalStockKg = totals.paddy.total + totals.rice.total;
  const topPaddy = getTopEntries(totals.paddy.varieties, 5);
  const topRice = getTopEntries(totals.rice.varieties, 5);
  const items = Array.isArray(inventoryData) ? inventoryData : [];

  return (
    <div className="space-y-6">
      {/* Inventory Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Icon name="barChart" className="w-5 h-5 text-muted-foreground" />
            Inventory Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-muted p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Stock</div>
              <div className="text-2xl font-bold text-foreground">
                {formatQuantity(totalStockKg, 'kg')}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Paddy + Rice</div>
            </div>
            <div className="rounded-lg border border-border bg-muted p-4">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Icon name="paddy" className="w-4 h-4 text-muted-foreground" />
                <span>Paddy</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatQuantity(totals.paddy.total, totals.paddy.unit)}
              </div>
              <div className="mt-2">
                <Badge variant="outline">
                  {Object.keys(totals.paddy.varieties).length} varieties
                </Badge>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted p-4">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Icon name="rice" className="w-4 h-4 text-muted-foreground" />
                <span>Rice</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatQuantity(totals.rice.total, totals.rice.unit)}
              </div>
              <div className="mt-2">
                <Badge variant="outline">
                  {Object.keys(totals.rice.varieties).length} varieties
                </Badge>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted p-4">
              <div className="text-sm text-muted-foreground mb-1">Gunny Bags</div>
              <div className="text-2xl font-bold text-foreground">
                {formatQuantity(totals.gunny.total, totals.gunny.unit)}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="muted">NB {totals.gunny.NB.toLocaleString()}</Badge>
                <Badge variant="muted">ONB {totals.gunny.ONB.toLocaleString()}</Badge>
                <Badge variant="muted">SS {totals.gunny.SS.toLocaleString()}</Badge>
                <Badge variant="muted">SWP {totals.gunny.SWP.toLocaleString()}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Icon name="box" className="w-5 h-5 text-muted-foreground" />
              Gunny Composition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['NB', 'ONB', 'SS', 'SWP'].map((type) => {
                const count = totals.gunny[type] || 0;
                const percent = getPercent(count, totals.gunny.total);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <span className="font-medium text-foreground">{type}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{count.toLocaleString()}</span> Bags • {percent}%
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${percent}%` }}
                        aria-label={`${type} ${percent}%`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Icon name="scale" className="w-5 h-5 text-muted-foreground" />
              Varieties Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="wheat" className="w-4 h-4 mr-2 text-muted-foreground" />
                  Paddy Varieties
                </h4>
                <div className="space-y-3">
                  {topPaddy.length > 0 ? (
                    topPaddy.map(([variety, qty]) => {
                      const percent = getPercent(qty, totals.paddy.total);
                      return (
                        <div key={variety}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{variety}</span>
                            <Badge variant="outline">{formatQuantity(qty, totals.paddy.unit)}</Badge>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-primary/70" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground">No paddy varieties</div>
                  )}
                  {Object.keys(totals.paddy.varieties).length > topPaddy.length && (
                    <div className="text-xs text-muted-foreground">
                      +{Object.keys(totals.paddy.varieties).length - topPaddy.length} more
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="rice" className="w-4 h-4 mr-2 text-muted-foreground" />
                  Rice Varieties
                </h4>
                <div className="space-y-3">
                  {topRice.length > 0 ? (
                    topRice.map(([variety, qty]) => {
                      const percent = getPercent(qty, totals.rice.total);
                      return (
                        <div key={variety}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{variety}</span>
                            <Badge variant="outline">{formatQuantity(qty, totals.rice.unit)}</Badge>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-secondary" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground">No rice varieties</div>
                  )}
                  {Object.keys(totals.rice.varieties).length > topRice.length && (
                    <div className="text-xs text-muted-foreground">
                      +{Object.keys(totals.rice.varieties).length - topRice.length} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Icon name="barChart" className="w-5 h-5 text-muted-foreground" />
            Quick Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg border border-border bg-muted">
              <div className="text-2xl font-bold text-foreground">{items.length}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center p-3 rounded-lg border border-border bg-muted">
              <div className="text-2xl font-bold text-foreground">
                {items.filter(item => item.category === 'gunny').length}
              </div>
              <div className="text-sm text-muted-foreground">Gunny Items</div>
            </div>
            <div className="text-center p-3 rounded-lg border border-border bg-muted">
              <div className="text-2xl font-bold text-foreground">
                {items.filter(item => item.category === 'paddy').length}
              </div>
              <div className="text-sm text-muted-foreground">Paddy Items</div>
            </div>
            <div className="text-center p-3 rounded-lg border border-border bg-muted">
              <div className="text-2xl font-bold text-foreground">
                {items.filter(item => item.category === 'rice').length}
              </div>
              <div className="text-sm text-muted-foreground">Rice Items</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;
