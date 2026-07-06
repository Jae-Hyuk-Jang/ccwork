import { useNotes } from '../context/NotesContext';
import { useNoteSearch } from '../hooks/useNoteSearch';
import { NoteItem } from './NoteItem';
import { SearchInput } from './SearchInput';

interface NoteListProps {
  selectedNoteId: string | null;
  onSelect: (id: string) => void;
}

export function NoteList({ selectedNoteId, onSelect }: NoteListProps) {
  const { notes, loading, error, deleteNote } = useNotes();
  const { query, setQuery, filteredNotes } = useNoteSearch(notes);

  if (loading) {
    return <p className="text-sm text-on-surface-variant text-center py-8">로딩 중...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive text-center py-8">오류: {error}</p>;
  }

  if (notes.length === 0) {
    return <p className="text-sm text-on-surface-variant text-center py-8">노트가 없습니다</p>;
  }

  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      {filteredNotes.length === 0 ? (
        <p className="text-sm text-on-surface-variant text-center py-8">검색 결과가 없습니다</p>
      ) : (
        <>
          <p className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant px-1 pb-1">
            노트 {filteredNotes.length}개
          </p>
          {filteredNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isSelected={note.id === selectedNoteId}
              onSelect={onSelect}
              onDelete={deleteNote}
            />
          ))}
        </>
      )}
    </>
  );
}
