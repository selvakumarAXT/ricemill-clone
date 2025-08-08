import React, { useState, useRef } from 'react';
import DialogBox from './DialogBox';
import WarningBox from './WarningBox';
import Button from './Button';
import Icon from './Icon';

function downloadCSV(data, columns, filename = 'export.csv') {
  const header = columns.map(col => col.label || col).join(',');
  const rows = data.map(row =>
    columns.map(col => {
      const accessor = typeof col === 'string' ? col.toLowerCase().replace(/\s+/g, '') : col.accessor;
      let val = row[accessor];
      if (typeof val === 'string') val = '"' + val.replace(/"/g, '""') + '"';
      return val;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const TableList = ({
  columns = [], // can be string or { label, accessor, renderCell, ... }
  data = [],
  renderRow,
  renderDetail,
  actions,
  pageSize = 10,
  className = '',
  selectable = false,
  onBulkAction,
  hideableColumns = false,
  resizableColumns = false,
  exportable = false,
  stickyHeader = false,
  showRowNumbers = false,
  loading = false,
  empty = 'No data',
  tableWidth = '100%', // NEW: allow custom width
  getDeleteWarning,
  pageSizeOptions = [5, 10, 25, 50, 100], // NEW: customizable page size options
  
  // Server-side pagination props
  serverSidePagination = false,
  paginationData = null, // { page, limit, total, pages }
  onPageChange = null, // callback for page changes
  onPageSizeChange = null, // callback for page size changes
  onSort = null, // callback for sorting
  sortData = null, // { col, dir }
}) => {
  const [expanded, setExpanded] = useState(null); // index of expanded row
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [sort, setSort] = useState({ col: null, dir: 'asc' });
  const [selected, setSelected] = useState([]); // array of row indices
  const [hiddenCols, setHiddenCols] = useState([]); // array of col indices
  const [colWidths, setColWidths] = useState({});
  const resizingCol = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [deleteHandler, setDeleteHandler] = useState(null);

  // Use server-side pagination data if available
  const isServerSide = serverSidePagination && paginationData;
  const currentPage = isServerSide ? paginationData.page : page;
  const totalPages = isServerSide ? paginationData.pages : Math.ceil(data.length / currentPageSize) || 1;
  const totalItems = isServerSide ? paginationData.total : data.length;
  const currentSort = isServerSide ? sortData : sort;

  // Reset to first page when page size changes (only for client-side)
  React.useEffect(() => {
    if (!isServerSide) {
      setPage(1);
    }
  }, [currentPageSize, isServerSide]);

  // Normalize columns to objects
  const normColumns = columns.map((col, idx) => {
    if (typeof col === 'string') {
      return { label: col, accessor: col.toLowerCase().replace(/\s+/g, ''), key: col.toLowerCase().replace(/\s+/g, ''), idx };
    }
    return { 
      ...col, 
      accessor: col.accessor || col.key,
      renderCell: col.renderCell || col.render, // Support both renderCell and render
      idx 
    };
  });
  const visibleCols = normColumns.filter((_, i) => !hiddenCols.includes(i));

  // Sorting logic - only for client-side
  let sortedData = [...data];
  if (!isServerSide && currentSort.col !== null) {
    const col = normColumns[currentSort.col];
    const accessor = col.accessor;
    sortedData.sort((a, b) => {
      let aVal = a[accessor];
      let bVal = b[accessor];
      if (col.sortFn) return col.sortFn(a, b, currentSort.dir);
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (aVal < bVal) return currentSort.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return currentSort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Use data directly for server-side, or paginate for client-side
  const displayData = isServerSide ? data : sortedData.slice((currentPage - 1) * currentPageSize, currentPage * currentPageSize);

  const handleRowClick = (idx) => {
    setExpanded(expanded === idx ? null : idx);
  };

  const handleSort = (colIdx) => {
    if (isServerSide && onSort) {
      // Server-side sorting
      const newSort = {
        col: colIdx,
        dir: currentSort.col === colIdx && currentSort.dir === 'asc' ? 'desc' : 'asc'
      };
      onSort(newSort);
    } else {
      // Client-side sorting
      setSort(prev => {
        if (prev.col === colIdx) {
          return { col: colIdx, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
        }
        return { col: colIdx, dir: 'asc' };
      });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(displayData.map((_, i) => (currentPage - 1) * currentPageSize + i));
    } else {
      setSelected([]);
    }
  };
  const handleSelectRow = (idx) => {
    setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  };

  // Column hiding
  const toggleCol = (i) => {
    setHiddenCols(cols => cols.includes(i) ? cols.filter(c => c !== i) : [...cols, i]);
  };

  // Column resizing
  const handleResizeStart = (i, e) => {
    resizingCol.current = i;
    startX.current = e.clientX;
    startWidth.current = colWidths[i] || e.target.parentElement.offsetWidth;
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  const handleResizeMove = (e) => {
    if (resizingCol.current !== null) {
      const delta = e.clientX - startX.current;
      setColWidths(widths => ({ ...widths, [resizingCol.current]: Math.max(60, startWidth.current + delta) }));
    }
  };
  const handleResizeEnd = () => {
    resizingCol.current = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // CSV Export
  const handleExport = () => {
    // For server-side, we might want to export all data, not just current page
    const exportData = isServerSide ? data : sortedData;
    downloadCSV(exportData, visibleCols);
  };

  // Row numbering
  const getRowNumber = (i) => (currentPage - 1) * currentPageSize + i + 1;

  // Loading/empty state
  if (loading) return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (!data.length) return <div className="p-4 text-center text-gray-500">{empty}</div>;

  // Helper to wrap delete actions
  const handleDeleteClick = (row, i, handler) => {
    setRowToDelete({ row, i });
    setDeleteHandler(() => handler);
    setShowDeleteDialog(true);
  };
  const confirmDelete = () => {
    if (deleteHandler && rowToDelete) {
      deleteHandler(rowToDelete.row, rowToDelete.i);
    }
    setShowDeleteDialog(false);
    setRowToDelete(null);
    setDeleteHandler(null);
  };
  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setRowToDelete(null);
    setDeleteHandler(null);
  };

  // Enhanced pagination functions
  const goToPage = (pageNum) => {
    if (isServerSide && onPageChange) {
      onPageChange(pageNum);
    } else {
      setPage(Math.max(1, Math.min(totalPages, pageNum)));
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    if (isServerSide && onPageSizeChange) {
      onPageSizeChange(newPageSize);
    } else {
      setCurrentPageSize(newPageSize);
    }
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className={`w-full max-w-full overflow-x-auto ${className} relative`}>
      {/* Column controls */}
      {hideableColumns && (
        <div className="mb-2 flex flex-wrap gap-2 items-center">
          <span className="font-medium text-xs">Columns:</span>
          {normColumns.map((col, i) => (
            <label key={i} className="text-xs flex items-center gap-1">
              <input type="checkbox" checked={!hiddenCols.includes(i)} onChange={() => toggleCol(i)} />
              {col.label}
            </label>
          ))}
        </div>
      )}
      {/* Export button */}
      {exportable && (
        <button onClick={handleExport} className="mb-2 px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">Export CSV</button>
      )}
      <div className={stickyHeader ? 'overflow-x-auto max-h-[60vh]' : ''}>
        <table
          className="min-w-full w-full divide-y divide-gray-200 border border-gray-300"
          style={{ width: tableWidth }}
        >
          <thead className={stickyHeader ? 'bg-gray-50 sticky top-0 z-10' : 'bg-gray-50'}>
            <tr>
              {showRowNumbers && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">#</th>}
              {selectable && <th className="px-3 py-3 border border-gray-300"><input type="checkbox" checked={selected.length === displayData.length && displayData.length > 0} onChange={handleSelectAll} /></th>}
              {visibleCols.map((col, i) => (
                <th
                  key={col.idx}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none relative border border-gray-300"
                  onClick={() => handleSort(col.idx)}
                  style={colWidths[col.idx] ? { width: colWidths[col.idx] } : {}}
                >
                  {col.label}
                  {currentSort.col === col.idx && (
                    <span className="ml-1">{currentSort.dir === 'asc' ? '▲' : '▼'}</span>
                  )}
                  {resizableColumns && (
                    <span
                      className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                      onMouseDown={e => handleResizeStart(col.idx, e)}
                    />
                  )}
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((row, i) => (
              <React.Fragment key={row.id || row._id || `row-${(currentPage - 1) * currentPageSize + i}`}>
                <tr
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => renderDetail && handleRowClick(i)}
                >
                  {showRowNumbers && <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-300">{getRowNumber(i)}</td>}
                  {selectable && <td className="px-3 py-4 border border-gray-300"><input type="checkbox" checked={selected.includes((currentPage - 1) * currentPageSize + i)} onChange={() => handleSelectRow((currentPage - 1) * currentPageSize + i)} /></td>}
                  {visibleCols.map((col, j) => (
                    <td key={`${row.id || row._id || i}-${col.idx}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                      {col.renderCell ? col.renderCell(row[col.key], i) : (renderRow ? renderRow(row, i)[col.idx] : (() => {
                        const value = row[col.key];
                        if (value === null || value === undefined) return '';
                        if (typeof value === 'object') return JSON.stringify(value);
                        return String(value);
                      })())}
                    </td>
                  ))}
                  {actions && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                    <div className="flex gap-2">
                      {(() => {
                        const rendered = actions(row, i);
                        if (Array.isArray(rendered)) {
                          return rendered.map((child, idx) => {
                            if (!child || !React.isValidElement(child)) return null;
                            
                            // Handle delete actions specially
                            if (child.props && child.props.icon === 'delete') {
                              return React.cloneElement(child, {
                                onClick: (e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(row, i, child.props.onClick);
                                },
                                key: child.key || `action-${idx}`
                              });
                            }
                            
                            // Handle other actions with event propagation prevention
                            return React.cloneElement(child, {
                              onClick: (e) => {
                                e.stopPropagation();
                                if (child.props.onClick) {
                                  child.props.onClick(e);
                                }
                              },
                              key: child.key || `action-${idx}`
                            });
                          });
                        } else if (rendered && React.isValidElement(rendered)) {
                          // Handle single action
                          if (rendered.props && rendered.props.icon === 'delete') {
                            return React.cloneElement(rendered, {
                              onClick: (e) => {
                                e.stopPropagation();
                                handleDeleteClick(row, i, rendered.props.onClick);
                              },
                              key: rendered.key || 'action-delete'
                            });
                          }
                          
                          return React.cloneElement(rendered, {
                            onClick: (e) => {
                              e.stopPropagation();
                              if (rendered.props.onClick) {
                                rendered.props.onClick(e);
                              }
                            },
                            key: rendered.key || 'action-single'
                          });
                        }
                        return rendered;
                      })()}
                    </div>
                  </td>}
                </tr>
                {renderDetail && expanded === i && (
                  <tr key={`detail-${row.id || row._id || (currentPage - 1) * currentPageSize + i}`}>
                    <td colSpan={visibleCols.length + (actions ? 1 : 0) + (selectable ? 1 : 0) + (showRowNumbers ? 1 : 0)} className="bg-gray-50 px-6 py-4">
                      {renderDetail(row, i)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* Bulk actions */}
      {selectable && onBulkAction && selected.length > 0 && (
        <div className="flex gap-2 mt-2">
          {onBulkAction(selected, displayData)}
        </div>
      )}
      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Show:</label>
              <select
                value={isServerSide ? paginationData.limit : currentPageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>

            {/* Results Info */}
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * currentPageSize) + 1} to {Math.min(currentPage * currentPageSize, totalItems)} of {totalItems} results
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="First page"
              >
                <Icon name="chevronDoubleLeft" className="w-4 h-4" />
              </button>

              {/* Previous Page */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <Icon name="chevronLeft" className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((pageNum, index) => (
                <React.Fragment key={index}>
                  {pageNum === '...' ? (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => goToPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )}
                </React.Fragment>
              ))}

              {/* Next Page */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <Icon name="chevronRight" className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Last page"
              >
                <Icon name="chevronDoubleRight" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <DialogBox title="Delete Confirmation" onClose={cancelDelete} size="2xl">
          <WarningBox>
            {typeof getDeleteWarning === 'function'
              ? getDeleteWarning(rowToDelete?.row)
              : getDeleteWarning || 'Deleting this item will remove all its data. This action cannot be undone. Are you sure you want to continue?'}
          </WarningBox>
          <div className="flex justify-end gap-2">
            <Button onClick={cancelDelete} variant="secondary" icon="close">Cancel</Button>
            <Button onClick={confirmDelete} variant="danger" icon="delete">Delete</Button>
          </div>
        </DialogBox>
      )}
    </div>
  );
};

export default TableList; 