import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Button from './Button';

const GroupedTable = ({
  data = [],
  columns = [],
  groupedHeaders = [],
  actions,
  renderDetail, // NEW: Add renderDetail prop for detailed view
  serverSidePagination = false,
  paginationData = null,
  onPageChange = null,
  onPageSizeChange = null,
  onSort = null,
  sortData = null,
  className = '',
  showRowNumbers = false,
  selectable = false,
  selected = [],
  onSelectAll = null,
  onSelectRow = null,
  tableTitle = '',
  childFilters,
}) => {
  const [expanded, setExpanded] = useState(null); // NEW: Track expanded row
  
  // Get user role from Redux store
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = user?.role === 'superadmin';

  const handleSort = (colKey) => {
    if (onSort) {
      const currentDir = sortData?.col === colKey ? sortData.dir : 'asc';
      const newDir = currentDir === 'asc' ? 'desc' : 'asc';
      onSort({ col: colKey, dir: newDir });
    }
  };

  const getSortIcon = (colKey) => {
    if (sortData?.col !== colKey) return '↕️';
    return sortData.dir === 'asc' ? '↑' : '↓';
  };

  // NEW: Handle row click for detailed view
  const handleRowClick = (rowIndex) => {
    if (renderDetail) {
      setExpanded(expanded === rowIndex ? null : rowIndex);
    }
  };

  return (
    <div className={`bg-card rounded-xl shadow-sm border border-border overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-border bg-muted">
        <h3 className="text-lg font-semibold text-foreground">{tableTitle}</h3>
        <p className="text-sm text-muted-foreground mt-1">Total: {paginationData?.total || data.length} records</p>
        <div className="mt-4">
          {childFilters}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border border-border">
          {/* Grouped Headers */}
          <thead className="bg-muted">
            {/* Main Header Row */}
            <tr>
              {showRowNumbers && (
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border border-border">
                  #
                </th>
              )}
              {selectable && (
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border border-border">
                  <input 
                    type="checkbox" 
                    onChange={onSelectAll}
                    className="rounded border-input text-primary focus:ring-ring" 
                  />
                </th>
              )}
              {groupedHeaders.map((group, groupIndex) => (
                <th 
                  key={groupIndex}
                  className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border border-border"
                  colSpan={group.columns.length}
                >
                  {group.label}
                </th>
              ))}
              {actions && isSuperAdmin && (
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border border-border">
                  Actions
                </th>
              )}
            </tr>
            
            {/* Sub-header Row */}
            <tr className="bg-muted">
              {showRowNumbers && (
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border border-border">
                </th>
              )}
              {selectable && (
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border border-border">
                </th>
              )}
              {groupedHeaders.map((group) =>
                group.columns.map((col, colIndex) => (
                  <th 
                    key={`${group.label}-${colIndex}`}
                    className="px-4 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted border border-border"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>{col.label}</span>
                      {onSort && <span className="text-xs">{getSortIcon(col.key)}</span>}
                    </div>
                  </th>
                ))
              )}
              {actions && isSuperAdmin && (
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border border-border">
                </th>
              )}
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="bg-card divide-y divide-border">
            {data.map((row, rowIndex) => (
              <React.Fragment key={row.id || rowIndex}>
                <tr 
                  className={`hover:bg-muted ${renderDetail ? 'cursor-pointer' : ''}`}
                  onClick={() => handleRowClick(rowIndex)}
                >
                  {showRowNumbers && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground border border-border">
                      {serverSidePagination 
                        ? ((paginationData.page - 1) * paginationData.limit) + rowIndex + 1
                        : rowIndex + 1
                      }
                    </td>
                  )}
                  {selectable && (
                    <td className="px-4 py-4 whitespace-nowrap border border-border">
                      <input 
                        type="checkbox" 
                        checked={selected.includes(rowIndex)}
                        onChange={() => onSelectRow(rowIndex)}
                        className="rounded border-input text-primary focus:ring-ring" 
                      />
                    </td>
                  )}
                  {groupedHeaders.map((group) =>
                    group.columns.map((col, colIndex) => (
                      <td 
                        key={`${row.id || rowIndex}-${col.key}`}
                        className="px-4 py-4 whitespace-nowrap text-sm text-foreground text-center border border-border"
                      >
                        {col.key === 'serialNumber' 
                          ? (serverSidePagination 
                              ? ((paginationData.page - 1) * paginationData.limit) + rowIndex + 1
                              : rowIndex + 1
                            )
                          : col.render 
                            ? col.render(row[col.key], row, rowIndex) 
                            : row[col.key]
                        }
                      </td>
                    ))
                  )}
                  {actions && isSuperAdmin && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground border border-border">
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
                {/* NEW: Detailed view row */}
                {renderDetail && expanded === rowIndex && (
                  <tr key={`detail-${row.id || rowIndex}`}>
                    <td 
                      colSpan={
                        groupedHeaders.reduce((total, group) => total + group.columns.length, 0) + 
                        (actions && isSuperAdmin ? 1 : 0) + 
                        (selectable ? 1 : 0) + 
                        (showRowNumbers ? 1 : 0)
                      } 
                      className="bg-muted px-6 py-4"
                    >
                      {renderDetail(row, rowIndex)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {serverSidePagination && paginationData && (
        <div className="px-6 py-4 border-t border-border bg-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <select
                value={paginationData.limit}
                onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                className="border border-input rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              >
                {[5, 10, 25, 50, 100].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Showing {((paginationData.page - 1) * paginationData.limit) + 1} to {Math.min(paginationData.page * paginationData.limit, paginationData.total)} of {paginationData.total} entries
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={() => onPageChange(paginationData.page - 1)}
                  disabled={paginationData.page <= 1}
                  className="px-3 py-1 text-sm border border-input rounded bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange(paginationData.page + 1)}
                  disabled={paginationData.page >= paginationData.pages}
                  className="px-3 py-1 text-sm border border-input rounded bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupedTable; 