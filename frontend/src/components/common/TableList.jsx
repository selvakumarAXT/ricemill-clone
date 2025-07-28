import React, { useState, useRef } from 'react';
import DialogBox from './DialogBox';
import WarningBox from './WarningBox';
import Button from './Button';

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
}) => {
  const [expanded, setExpanded] = useState(null); // index of expanded row
  const [page, setPage] = useState(1);
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

  // Sorting logic
  let sortedData = [...data];
  if (sort.col !== null) {
    const col = normColumns[sort.col];
    const accessor = col.accessor;
    sortedData.sort((a, b) => {
      let aVal = a[accessor];
      let bVal = b[accessor];
      if (col.sortFn) return col.sortFn(a, b, sort.dir);
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (aVal < bVal) return sort.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const pagedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const handleRowClick = (idx) => {
    setExpanded(expanded === idx ? null : idx);
  };

  const handleSort = (colIdx) => {
    setSort(prev => {
      if (prev.col === colIdx) {
        return { col: colIdx, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      }
      return { col: colIdx, dir: 'asc' };
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(pagedData.map((_, i) => (page - 1) * pageSize + i));
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
    downloadCSV(sortedData, visibleCols);
  };

  // Row numbering
  const getRowNumber = (i) => (page - 1) * pageSize + i + 1;

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
          className="min-w-full w-full divide-y divide-gray-200"
          style={{ width: tableWidth }}
        >
          <thead className={stickyHeader ? 'bg-gray-50 sticky top-0 z-10' : 'bg-gray-50'}>
            <tr>
              {showRowNumbers && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>}
              {selectable && <th className="px-3 py-3"><input type="checkbox" checked={selected.length === pagedData.length && pagedData.length > 0} onChange={handleSelectAll} /></th>}
              {visibleCols.map((col, i) => (
                <th
                  key={col.idx}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none relative"
                  onClick={() => handleSort(col.idx)}
                  style={colWidths[col.idx] ? { width: colWidths[col.idx] } : {}}
                >
                  {col.label}
                  {sort.col === col.idx && (
                    <span className="ml-1">{sort.dir === 'asc' ? '▲' : '▼'}</span>
                  )}
                  {resizableColumns && (
                    <span
                      className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                      onMouseDown={e => handleResizeStart(col.idx, e)}
                    />
                  )}
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagedData.map((row, i) => (
              <React.Fragment key={row.id || row._id || `row-${(page - 1) * pageSize + i}`}>
                <tr
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => renderDetail && handleRowClick(i)}
                >
                  {showRowNumbers && <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{getRowNumber(i)}</td>}
                  {selectable && <td className="px-3 py-4"><input type="checkbox" checked={selected.includes((page - 1) * pageSize + i)} onChange={() => handleSelectRow((page - 1) * pageSize + i)} /></td>}
                  {visibleCols.map((col, j) => (
                    <td key={`${row.id || row._id || i}-${col.idx}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {col.renderCell ? col.renderCell(row[col.key], i) : (renderRow ? renderRow(row, i)[col.idx] : (() => {
                        const value = row[col.key];
                        if (value === null || value === undefined) return '';
                        if (typeof value === 'object') return JSON.stringify(value);
                        return String(value);
                      })())}
                    </td>
                  ))}
                  {actions && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{
                    (() => {
                      const rendered = actions(row, i);
                      if (Array.isArray(rendered)) {
                        return rendered.map((child, idx) =>
                          child && child.props && child.props.icon === 'delete'
                            ? React.cloneElement(child, {
                                onClick: (e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(row, i, child.props.onClick);
                                },
                                key: child.key || `action-${idx}`
                              })
                            : child && React.isValidElement(child)
                              ? React.cloneElement(child, { key: child.key || `action-${idx}` })
                              : child
                        );
                      } else if (rendered && rendered.props && rendered.props.icon === 'delete') {
                        return React.cloneElement(rendered, {
                          onClick: (e) => {
                            e.stopPropagation();
                            handleDeleteClick(row, i, rendered.props.onClick);
                          },
                          key: rendered.key || 'action-delete'
                        });
                      }
                      return rendered;
                    })()
                  }</td>}
                </tr>
                {renderDetail && expanded === i && (
                  <tr key={`detail-${row.id || row._id || (page - 1) * pageSize + i}`}>
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
          {onBulkAction(selected, pagedData)}
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 mt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <DialogBox title="Delete Confirmation" onClose={cancelDelete}>
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