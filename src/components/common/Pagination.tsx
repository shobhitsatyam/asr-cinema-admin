import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderTop: '1px solid var(--color-border-subtle)',
        fontSize: '0.8125rem',
        color: 'var(--color-text-muted)',
        backgroundColor: '#FFFFFF',
        flexWrap: 'wrap',
        gap: 12
      }}
    >
      <div>
        Showing <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{startItem}</span> to{' '}
        <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{endItem}</span> of{' '}
        <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{totalItems}</span> entries
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{ padding: '5px 10px' }}
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <span style={{ padding: '0 8px', fontWeight: 600, color: 'var(--color-text-main)' }}>
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{ padding: '5px 10px' }}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
