interface NoteTagBadgeProps {
  tag: string;
  onDelete?: (tag: string) => void;
}

export function NoteTagBadge({ tag, onDelete }: NoteTagBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
      #{tag}
      {onDelete && (
        <button
          onClick={() => onDelete(tag)}
          className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
        >
          ×
        </button>
      )}
    </span>
  );
}
