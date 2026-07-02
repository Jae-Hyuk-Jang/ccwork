interface NoteTagBadgeProps {
  tag: string;
}

export function NoteTagBadge({ tag }: NoteTagBadgeProps) {
  return (
    <span className="inline-block bg-muted text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
      #{tag}
    </span>
  );
}
