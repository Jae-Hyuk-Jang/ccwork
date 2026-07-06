import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoteItem } from './NoteItem';
import { Note } from '../types/note';

const baseNote: Note = {
  id: '1',
  title: '노트',
  content: '내용',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('NoteItem - 태그 읽기 전용 표시 (이슈 1)', () => {
  it('태그가 있으면 칩이 읽기 전용으로 표시된다 (삭제 버튼 없음)', () => {
    render(
      <NoteItem
        note={{ ...baseNote, tags: ['공부'] }}
        isSelected={false}
        onSelect={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByText('#공부')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '×' })).not.toBeInTheDocument();
  });

  it('태그가 여러 개면 순서대로 표시된다', () => {
    render(
      <NoteItem
        note={{ ...baseNote, tags: ['React', 'TypeScript'] }}
        isSelected={false}
        onSelect={() => {}}
        onDelete={() => {}}
      />,
    );

    const chips = screen.getAllByText(/^#/);
    expect(chips.map((c) => c.textContent)).toEqual(['#React', '#TypeScript']);
  });

  it('태그가 없으면 태그 영역이 표시되지 않는다', () => {
    render(<NoteItem note={baseNote} isSelected={false} onSelect={() => {}} onDelete={() => {}} />);

    expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
  });
});
