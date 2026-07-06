import { useState, useEffect } from 'react';
import { useNotes } from '../context/NotesContext';
import { useTags } from '../hooks/useTags';
import { TagInputField } from './TagInputField';

interface NoteEditorProps {
  selectedNoteId: string | null;
  isCreating: boolean;
  onDone: () => void;
}

export function NoteEditor({ selectedNoteId, isCreating, onDone }: NoteEditorProps) {
  const { notes, createNote, updateNote } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { tags, tagInput, setTagInput, addTag, deleteTag, reset: resetTags } = useTags();
  const [saving, setSaving] = useState(false);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  // 선택된 노트가 바뀔 때 폼 동기화
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      resetTags(selectedNote.tags ?? []);
    } else if (isCreating) {
      setTitle('');
      setContent('');
      resetTags([]);
    }
  }, [selectedNoteId, isCreating]); // eslint-disable-line react-hooks/exhaustive-deps

  // 취소 시 미저장 변경을 되돌린다. selectedNoteId/isCreating이 그대로 유지되는 경우
  // (같은 노트를 계속 편집 중일 때) 동기화 useEffect가 재실행되지 않으므로 명시적으로 되돌린다.
  const handleCancel = () => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      resetTags(selectedNote.tags ?? []);
    } else {
      setTitle('');
      setContent('');
      resetTags([]);
    }
    onDone();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      console.error('제목을 입력해주세요');
      return;
    }

    setSaving(true);
    try {
      if (isCreating) {
        await createNote(title, content, tags);
      } else if (selectedNoteId) {
        await updateNote(selectedNoteId, { title, content, tags });
      }
      onDone();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // 아무것도 선택 안 된 상태
  if (!isCreating && !selectedNoteId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <p className="text-5xl">📝</p>
          <p className="text-on-surface-variant text-sm">노트를 선택하거나 새 노트를 만드세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-3xl px-8 sm:px-12 py-8 max-w-2xl">
      {/* 섹션 라벨 */}
      <p className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-6">
        {isCreating ? '새 노트' : '노트 편집'}
      </p>

      {/* 제목 입력 */}
      <input
        aria-label="제목"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        className="w-full text-xl font-bold text-on-surface bg-transparent border-none outline-none focus:ring-1 focus:ring-tertiary/40 rounded placeholder:text-on-surface-variant/50 mb-4"
      />

      {/* 태그 영역 */}
      <TagInputField
        tags={tags}
        tagInput={tagInput}
        onTagInputChange={setTagInput}
        onAddTag={addTag}
        onDeleteTag={deleteTag}
      />

      {/* 내용 입력 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="내용을 입력하세요..."
        rows={14}
        className="w-full text-base text-on-surface-variant bg-transparent border-none outline-none focus:ring-1 focus:ring-tertiary/40 rounded resize-none placeholder:text-on-surface-variant/50 leading-relaxed mt-4"
      />

      {/* 버튼 영역 */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-tertiary to-tertiary-container text-on-tertiary px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
        <button
          onClick={handleCancel}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-on-surface bg-surface-container-high hover:bg-surface-container-highest transition-colors cursor-pointer"
        >
          취소
        </button>
      </div>
    </div>
  );
}
