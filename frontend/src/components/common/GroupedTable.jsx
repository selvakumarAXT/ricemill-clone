import React, { useState } from 'react';
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
}) => {
  const [expanded, setExpanded] = useState(null); // NEW: Track expanded row

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
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">{tableTitle}</h3>
        <p className="text-sm text-gray-600 mt-1">Total: {paginationData?.total || data.length} records</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          {/* Grouped Headers */}
          <thead className="bg-gray-50">
            {/* Main Header Row */}
            <tr>
              {showRowNumbers && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                  #
                </th>
              )}
              {selectable && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                  <input 
                    type="checkbox" 
                    onChange={onSelectAll}
                    className="rounded border-gray-300" 
                  />
                </th>
              )}
              {groupedHeaders.map((group, groupIndex) => (
                <th 
                  key={groupIndex}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300"
                  colSpan={group.columns.length}
                >
                  {group.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                  Actions
                </th>
              )}
            </tr>
            
            {/* Sub-header Row */}
            <tr className="bg-gray-50">
              {showRowNumbers && (
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                </th>
              )}
              {selectable && (
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                </th>
              )}
              {groupedHeaders.map((group) =>
                group.columns.map((col, colIndex) => (
                  <th 
                    key={`${group.label}-${colIndex}`}
                    className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 border border-gray-300"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>{col.label}</span>
                      {onSort && <span className="text-xs">{getSortIcon(col.key)}</span>}
                    </div>
                  </th>
                ))
              )}
              {actions && (
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                </th>
              )}
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <React.Fragment key={row.id || rowIndex}>
                <tr 
                  className={`hover:bg-gray-50 ${renderDetail ? 'cursor-pointer' : ''}`}
                  onClick={() => handleRowClick(rowIndex)}
                >
                  {showRowNumbers && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                      {serverSidePagination 
                        ? ((paginationData.page - 1) * paginationData.limit) + rowIndex + 1
                        : rowIndex + 1
                      }
                    </td>
                  )}
                  {selectable && (
                    <td className="px-4 py-4 whitespace-nowrap border border-gray-300">
                      <input 
                        type="checkbox" 
                        checked={selected.includes(rowIndex)}
                        onChange={() => onSelectRow(rowIndex)}
                        className="rounded border-gray-300" 
                      />
                    </td>
                  )}
                  {groupedHeaders.map((group) =>
                    group.columns.map((col, colIndex) => (
                      <td 
                        key={`${row.id || rowIndex}-${col.key}`}
                        className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-300"
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
                  {actions && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
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
                        (actions ? 1 : 0) + 
                        (selectable ? 1 : 0) + 
                        (showRowNumbers ? 1 : 0)
                      } 
                      className="bg-gray-50 px-6 py-4"
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
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={paginationData.limit}
                onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {[5, 10, 25, 50, 100].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {((paginationData.page - 1) * paginationData.limit) + 1} to {Math.min(paginationData.page * paginationData.limit, paginationData.total)} of {paginationData.total} entries
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={() => onPageChange(paginationData.page - 1)}
                  disabled={paginationData.page <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange(paginationData.page + 1)}
                  disabled={paginationData.page >= paginationData.pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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