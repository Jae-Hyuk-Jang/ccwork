import { NoteTagBadge } from './NoteTagBadge';

interface TagInputFieldProps {
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onDeleteTag: (tag: string) => void;
}

export function TagInputField({
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onDeleteTag,
}: TagInputFieldProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-4">
      {tags.map((tag) => (
        <NoteTagBadge key={tag} tag={tag} onDelete={onDeleteTag} />
      ))}
      <input
        aria-label="태그 입력"
        type="text"
        value={tagInput}
        onChange={(e) => onTagInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onAddTag();
          }
        }}
        placeholder="태그 입력 후 Enter"
        className="min-w-24 flex-1 text-xs text-on-surface bg-transparent border-none outline-none focus:ring-1 focus:ring-tertiary/40 rounded placeholder:text-on-surface-variant/50 py-0.5"
      />
    </div>
  );
}
