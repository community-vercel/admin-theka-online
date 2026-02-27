// src/components/Common/DataTable.jsx
import { useState, useMemo, useEffect } from 'react';
import { HiChevronLeft, HiChevronRight, HiChevronUp, HiChevronDown } from 'react-icons/hi';

const DataTable = ({ columns, data, itemsPerPage = 10, responsiveBreakpoint = 'sm' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isMobileView, setIsMobileView] = useState(false);

  // Handle responsive behavior
  const updateView = () => {
    const breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280
    };
    setIsMobileView(window.innerWidth < breakpoints[responsiveBreakpoint]);
  };

  // Initialize and update on resize
  useEffect(() => {
    updateView();
    window.addEventListener('resize', updateView);
    return () => window.removeEventListener('resize', updateView);
  }, [responsiveBreakpoint]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Reset to first page when data changes (e.g., on search/filter)
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Mobile card view
  const MobileCardView = ({ item }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
      {columns.map((column) => (
        <div key={column.accessor} className="mb-2 last:mb-0">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {column.Header}
          </div>
          <div className="text-sm text-gray-900 mt-1">
            {column.Cell
              ? column.Cell({ value: item[column.accessor], row: item })
              : item[column.accessor]}
          </div>
        </div>
      ))}
    </div>
  );

  // Responsive pagination - show limited page numbers on mobile
  const getPageNumbers = () => {
    const maxVisiblePages = isMobileView ? 3 : 5;
    const half = Math.floor(maxVisiblePages / 2);

    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + maxVisiblePages - 1, totalPages);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {isMobileView ? (
        // Mobile View
        <div className="p-4">
          {currentData.map((item, index) => (
            <MobileCardView key={index} item={item} />
          ))}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.accessor}
                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(column.accessor)}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="truncate">{column.Header}</span>
                      {sortConfig.key === column.accessor && (
                        <span>
                          {sortConfig.direction === 'asc' ? (
                            <HiChevronUp className="h-4 w-4" />
                          ) : (
                            <HiChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td
                      key={column.accessor}
                      className="px-4 sm:px-6 py-3 text-sm text-gray-900"
                    >
                      <div className="truncate max-w-[200px] lg:max-w-[300px] xl:max-w-none">
                        {column.Cell
                          ? column.Cell({ value: row[column.accessor], row })
                          : row[column.accessor]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Responsive Pagination */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, sortedData.length)}</span> of{' '}
              <span className="font-medium">{sortedData.length}</span> entries
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 sm:p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Previous page"
              >
                <HiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* First page */}
              {currentPage > 3 && !isMobileView && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="px-2 sm:px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="px-1">...</span>}
                </>
              )}

              {/* Page numbers */}
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-sm sm:text-base transition-colors ${currentPage === page
                    ? 'bg-blue-600 text-white border-transparent'
                    : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}

              {/* Last page */}
              {currentPage < totalPages - 2 && !isMobileView && (
                <>
                  {currentPage < totalPages - 3 && <span className="px-1">...</span>}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-2 sm:px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 sm:p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Next page"
              >
                <HiChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Mobile page info */}
            {isMobileView && (
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;