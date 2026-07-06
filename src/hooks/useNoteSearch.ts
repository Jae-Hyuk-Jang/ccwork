import { useMemo, useState } from 'react';
import { Note } from '../types/note';
import { findMatchRanges } from '../utils/textMatch';

export function useNoteSearch(notes: Note[]) {
  const [query, setQuery] = useState('');

  const filteredNotes = useMemo(() => {
    if (!query.trim()) return notes;

    return notes.filter(
      (note) =>
        findMatchRanges(note.title, query).length > 0 ||
        findMatchRanges(note.content, query).length > 0,
    );
  }, [notes, query]);

  return { query, setQuery, filteredNotes };
}
