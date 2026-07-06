import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNoteSearch } from './useNoteSearch';
import { Note } from '../types/note';

const notes: Note[] = [
  {
    id: '1',
    title: 'React 공부',
    content: '리액트 훅을 정리한다',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'TypeScript 정리',
    content: '타입스크립트를 공부 중입니다',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    title: '회의록',
    content: '오늘의 논의 사항',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
];

describe('useNoteSearch', () => {
  it('초기 query는 빈 문자열이고 filteredNotes는 전체 notes다', () => {
    const { result } = renderHook(() => useNoteSearch(notes));

    expect(result.current.query).toBe('');
    expect(result.current.filteredNotes).toEqual(notes);
  });

  it('제목에 검색어가 대소문자 무시로 일치하는 노트만 남긴다', () => {
    const { result } = renderHook(() => useNoteSearch(notes));

    act(() => {
      result.current.setQuery('react');
    });

    expect(result.current.filteredNotes).toEqual([notes[0]]);
  });

  it('본문에 검색어가 일치하면 그 노트도 포함한다', () => {
    const { result } = renderHook(() => useNoteSearch(notes));

    act(() => {
      result.current.setQuery('타입스크립트');
    });

    expect(result.current.filteredNotes).toEqual([notes[1]]);
  });

  it('공백만 입력하면(trim 결과 빈 문자열) 필터링 없이 전체 notes를 반환한다', () => {
    const { result } = renderHook(() => useNoteSearch(notes));

    act(() => {
      result.current.setQuery('   ');
    });

    expect(result.current.filteredNotes).toEqual(notes);
  });

  it('검색어를 지우면(빈 문자열) 다시 전체 notes를 반환한다', () => {
    const { result } = renderHook(() => useNoteSearch(notes));

    act(() => {
      result.current.setQuery('react');
    });
    act(() => {
      result.current.setQuery('');
    });

    expect(result.current.filteredNotes).toEqual(notes);
  });

  it('일치하는 노트가 없으면 빈 배열을 반환한다', () => {
    const { result } = renderHook(() => useNoteSearch(notes));

    act(() => {
      result.current.setQuery('존재하지않는단어');
    });

    expect(result.current.filteredNotes).toEqual([]);
  });
});
