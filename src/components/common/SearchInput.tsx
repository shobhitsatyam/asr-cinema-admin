import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  width?: number | string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  width = 280
}) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: typeof width === 'number' ? `${width}px` : width
      }}
    >
      <Search
        size={16}
        color="var(--color-text-muted)"
        style={{
          position: 'absolute',
          left: 12,
          pointerEvents: 'none'
        }}
      />
      <input
        type="text"
        className="form-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          paddingLeft: 36,
          paddingRight: value ? 32 : 12,
          height: 38,
          fontSize: '0.85rem'
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: 8,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)'
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
