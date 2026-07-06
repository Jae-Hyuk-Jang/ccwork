import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteList } from './NoteList';
import { useNotes } from '../context/NotesContext';
import { Note } from '../types/note';

vi.mock('../context/NotesContext');

const mockedUseNotes = vi.mocked(useNotes);

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

function setNotesState(overrides: Partial<ReturnType<typeof useNotes>>) {
  mockedUseNotes.mockReturnValue({
    notes: [],
    loading: false,
    error: null,
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    ...overrides,
  });
}

describe('NoteList - 검색 (이슈 1)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('노트가 있으면 검색창이 보인다', () => {
    setNotesState({ notes });
    render(<NoteList selectedNoteId={null} onSelect={() => {}} />);

    expect(screen.getByLabelText('노트 검색')).toBeInTheDocument();
  });

  it('로딩 중에는 검색창이 보이지 않는다', () => {
    setNotesState({ loading: true });
    render(<NoteList selectedNoteId={null} onSelect={() => {}} />);

    expect(screen.queryByLabelText('노트 검색')).not.toBeInTheDocument();
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('에러 상태에서는 검색창이 보이지 않는다', () => {
    setNotesState({ error: '문제가 발생했습니다' });
    render(<NoteList selectedNoteId={null} onSelect={() => {}} />);

    expect(screen.queryByLabelText('노트 검색')).not.toBeInTheDocument();
  });

  it('노트가 애초에 0건이면 검색창이 보이지 않고 "노트가 없습니다"만 표시된다', () => {
    setNotesState({ notes: [] });
    render(<NoteList selectedNoteId={null} onSelect={() => {}} />);

    expect(screen.queryByLabelText('노트 검색')).not.toBeInTheDocument();
    expect(screen.getByText('노트가 없습니다')).toBeInTheDocument();
  });

  it('검색어를 입력하면 대소문자 무시로 일치하는 노트만 남고 나머지는 사라진다', async () => {
    const user = userEvent.setup();
    setNotesState({ notes });
    render(<NoteList selectedNoteId={null} onSelect={() => {}} />);

    await user.type(screen.getByLabelText('노트 검색'), 'react');

    expect(screen.getByRole('heading', { name: 'React 공부' })).toBeInTheDocument();
    expect(screen.queryByText('TypeScript 정리')).not.toBeInTheDocument();
    expect(screen.queryByText('회의록')).not.toBeInTheDocument();
  });

  it('본문 일치도 검색 대상이다', async () => {
    const user = userEvent.setup();
    setNotesState({ notes });
    render(<NoteList selectedNoteId={null} onSelect={() => {}} />);

    await user.type(screen.getByLabelText('노트 검색'), '타입스크립트');

    expect(screen.getByText('TypeScript 정리')).toBeInTheDocument();
    expect(screen.queryByText('React 공부')).not.toBeInTheDocument();
  });

  it('일치하는 노트가 없으면 "검색 결과가 없습니다"를 표시한다 (전체 0건 문구와 다름)', async () => {
    const user = userEvent.setup();
    setNotesState({ notes });
    render(<NoteList selectedNoteId={null} onSelect={() => {}} />);

    await user.type(screen.getByLabelText('노트 검색'), '존재하지않는단어');

    expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
    expect(screen.queryByText('노트가 없습니다')).not.toBeInTheDocument();
  });

  it('공백만 입력하면 필터링 없이 전체 노트가 보인다', async () => {
    const user = userEvent.setup();
    setNotesState({ notes });
    render(<NoteList selectedNoteId={null} onSelect={() => {}} />);

    await user.type(screen.getByLabelText('노트 검색'), '   ');

    expect(screen.getByText('React 공부')).toBeInTheDocument();
    expect(screen.getByText('TypeScript 정리')).toBeInTheDocument();
    expect(screen.getByText('회의록')).toBeInTheDocument();
  });

  it('x 버튼을 클릭하면 검색어가 지워지고 전체 노트가 다시 보인다', async () => {
    const user = userEvent.setup();
    setNotesState({ notes });
    const { container } = render(<NoteList selectedNoteId={null} onSelect={() => {}} />);

    await user.type(screen.getByLabelText('노트 검색'), 'react');
    expect(screen.queryByText('회의록')).not.toBeInTheDocument();
    expect(container.querySelector('mark')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: '검색어 지우기' }));

    expect(screen.getByText('React 공부')).toBeInTheDocument();
    expect(screen.getByText('TypeScript 정리')).toBeInTheDocument();
    expect(screen.getByText('회의록')).toBeInTheDocument();
    expect(container.querySelector('mark')).not.toBeInTheDocument();
  });
});
