import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'Try adjusting your search query or filters to find what you are looking for.',
  actionText,
  onAction,
  icon
}) => {
  return (
    <div
      style={{
        padding: '50px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%'
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          color: 'var(--color-text-muted)'
        }}
      >
        {icon || <SearchX size={26} />}
      </div>

      <h4
        style={{
          fontFamily: 'var(--font-brand)',
          fontSize: '1.05rem',
          fontWeight: 600,
          color: 'var(--color-text-main)',
          marginBottom: 6
        }}
      >
        {title}
      </h4>

      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          maxWidth: 380,
          lineHeight: 1.45,
          marginBottom: actionText ? 18 : 0
        }}
      >
        {description}
      </p>

      {actionText && onAction && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};
