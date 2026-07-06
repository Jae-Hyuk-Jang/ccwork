interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative flex items-center mb-3">
      <input
        aria-label="노트 검색"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="노트 검색..."
        className="w-full text-sm text-on-surface bg-surface-container-lowest rounded-xl px-3 py-2 pr-8 border-none outline-none focus:ring-1 focus:ring-tertiary/40 placeholder:text-on-surface-variant/50"
      />
      {value && (
        <button
          aria-label="검색어 지우기"
          onClick={() => onChange('')}
          className="absolute right-2 text-on-surface-variant hover:text-destructive transition-colors cursor-pointer"
        >
          ×
        </button>
      )}
    </div>
  );
}
