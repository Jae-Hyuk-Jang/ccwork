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
        query=""
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
        query=""
      />,
    );

    const chips = screen.getAllByText(/^#/);
    expect(chips.map((c) => c.textContent)).toEqual(['#React', '#TypeScript']);
  });

  it('태그가 없으면 태그 영역이 표시되지 않는다', () => {
    render(
      <NoteItem
        note={baseNote}
        isSelected={false}
        onSelect={() => {}}
        onDelete={() => {}}
        query=""
      />,
    );

    expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
  });
});

describe('NoteItem - 검색 하이라이트 (이슈 2)', () => {
  it('query가 비어있으면 하이라이트가 적용되지 않는다', () => {
    const { container } = render(
      <NoteItem
        note={baseNote}
        isSelected={false}
        onSelect={() => {}}
        onDelete={() => {}}
        query=""
      />,
    );

    expect(container.querySelector('mark')).not.toBeInTheDocument();
  });

  it('제목과 본문 양쪽에 일치하면 둘 다 하이라이트된다', () => {
    const note = { ...baseNote, title: 'React 공부', content: 'react 훅 정리' };
    const { container } = render(
      <NoteItem
        note={note}
        isSelected={false}
        onSelect={() => {}}
        onDelete={() => {}}
        query="react"
      />,
    );

    expect(container.querySelectorAll('mark')).toHaveLength(2);
  });

  it('원문 대소문자를 그대로 유지한 채 하이라이트한다', () => {
    const note = { ...baseNote, title: '노트', content: 'react 훅 정리' };
    const { container } = render(
      <NoteItem
        note={note}
        isSelected={false}
        onSelect={() => {}}
        onDelete={() => {}}
        query="REACT"
      />,
    );

    expect(container.querySelector('mark')?.textContent).toBe('react');
  });
});
