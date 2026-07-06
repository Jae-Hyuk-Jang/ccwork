import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditor } from './NoteEditor';
import { NotesProvider, useNotes } from '../context/NotesContext';
import * as api from '../api/notes';
import { Note } from '../types/note';

vi.mock('../api/notes');

const mockedApi = vi.mocked(api);

const sampleNote: Note = {
  id: '1',
  title: '샘플 노트',
  content: '내용',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  tags: ['React', 'TypeScript'],
};

interface HarnessProps {
  selectedNoteId: string | null;
  isCreating: boolean;
  onDone: () => void;
}

// 실제 앱에서는 notes가 로드된 뒤에야(App.tsx가 NoteList 클릭을 통해) selectedNoteId가 채워진다.
// loading이 끝나기 전까지 NoteEditor를 마운트하지 않아 그 순서를 테스트에서도 재현한다.
function Harness({ selectedNoteId, isCreating, onDone }: HarnessProps) {
  const { loading } = useNotes();
  if (loading) return null;
  return <NoteEditor selectedNoteId={selectedNoteId} isCreating={isCreating} onDone={onDone} />;
}

async function renderEditor({
  selectedNoteId = null as string | null,
  isCreating = false,
  onDone = vi.fn(),
  notes = [sampleNote],
}: Partial<{
  selectedNoteId: string | null;
  isCreating: boolean;
  onDone: () => void;
  notes: Note[];
}> = {}) {
  mockedApi.fetchNotes.mockResolvedValue(notes);
  render(
    <NotesProvider>
      <Harness selectedNoteId={selectedNoteId} isCreating={isCreating} onDone={onDone} />
    </NotesProvider>,
  );
  if (selectedNoteId || isCreating) {
    await screen.findByText(isCreating ? '새 노트' : '노트 편집');
  }
  return { onDone };
}

describe('NoteEditor - 태그', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('이슈 1: 태그가 있는 노트를 열면 태그 칩이 순서대로 표시된다', async () => {
    await renderEditor({ selectedNoteId: '1' });

    expect(await screen.findByText('#React')).toBeInTheDocument();
    expect(screen.getByText('#TypeScript')).toBeInTheDocument();
  });

  it('이슈 1: 태그가 없는 노트를 열면 태그 칩이 표시되지 않는다', async () => {
    await renderEditor({ selectedNoteId: '1', notes: [{ ...sampleNote, tags: undefined }] });

    await screen.findByDisplayValue('샘플 노트');
    expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
  });

  it('이슈 2: 태그 입력 후 Enter를 누르면 칩이 추가되고 입력창이 비워진다', async () => {
    const user = userEvent.setup();
    await renderEditor({ selectedNoteId: '1' });

    const input = await screen.findByLabelText('태그 입력');
    await user.type(input, '공부{Enter}');

    expect(screen.getByText('#공부')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('이슈 2: 이미 있는 태그와 대소문자만 다르면 추가되지 않는다', async () => {
    const user = userEvent.setup();
    await renderEditor({ selectedNoteId: '1' });

    const input = await screen.findByLabelText('태그 입력');
    await user.type(input, 'react{Enter}');

    expect(screen.getAllByText('#React')).toHaveLength(1);
  });

  it('이슈 2/3: 저장을 누르기 전까지는 API가 호출되지 않는다', async () => {
    const user = userEvent.setup();
    await renderEditor({ selectedNoteId: '1' });

    const input = await screen.findByLabelText('태그 입력');
    await user.type(input, '새태그{Enter}');

    expect(mockedApi.updateNote).not.toHaveBeenCalled();
  });

  it('이슈 2: 저장을 누르면 추가된 태그가 제목/내용과 함께 서버에 반영된다', async () => {
    const user = userEvent.setup();
    mockedApi.updateNote.mockResolvedValue({
      ...sampleNote,
      tags: ['React', 'TypeScript', '새태그'],
    });
    await renderEditor({ selectedNoteId: '1' });

    const input = await screen.findByLabelText('태그 입력');
    await user.type(input, '새태그{Enter}');
    await user.click(screen.getByText('저장'));

    await waitFor(() =>
      expect(mockedApi.updateNote).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ tags: ['React', 'TypeScript', '새태그'] }),
      ),
    );
  });

  it('이슈 3: x 버튼을 클릭하면 확인 없이 즉시 해당 태그가 제거된다', async () => {
    const user = userEvent.setup();
    await renderEditor({ selectedNoteId: '1' });

    const reactChip = (await screen.findByText('#React')).closest('span')!;
    await user.click(within(reactChip).getByRole('button'));

    expect(screen.queryByText('#React')).not.toBeInTheDocument();
    expect(screen.getByText('#TypeScript')).toBeInTheDocument();
  });

  it('이슈 3: 저장을 누르면 삭제된 태그가 서버에 반영된다', async () => {
    const user = userEvent.setup();
    mockedApi.updateNote.mockResolvedValue({ ...sampleNote, tags: ['TypeScript'] });
    await renderEditor({ selectedNoteId: '1' });

    const reactChip = (await screen.findByText('#React')).closest('span')!;
    await user.click(within(reactChip).getByRole('button'));
    await user.click(screen.getByText('저장'));

    await waitFor(() =>
      expect(mockedApi.updateNote).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ tags: ['TypeScript'] }),
      ),
    );
  });

  it('이슈 4: 태그 추가 후 취소하면 원래 태그만 남고 서버에는 반영되지 않는다', async () => {
    const user = userEvent.setup();
    await renderEditor({ selectedNoteId: '1' });

    const input = await screen.findByLabelText('태그 입력');
    await user.type(input, '임시태그{Enter}');
    expect(screen.getByText('#임시태그')).toBeInTheDocument();

    await user.click(screen.getByText('취소'));

    expect(screen.queryByText('#임시태그')).not.toBeInTheDocument();
    expect(screen.getByText('#React')).toBeInTheDocument();
    expect(mockedApi.updateNote).not.toHaveBeenCalled();
  });

  it('이슈 4: 태그 삭제 후 취소하면 삭제했던 태그가 다시 나타난다', async () => {
    const user = userEvent.setup();
    await renderEditor({ selectedNoteId: '1' });

    const reactChip = (await screen.findByText('#React')).closest('span')!;
    await user.click(within(reactChip).getByRole('button'));
    expect(screen.queryByText('#React')).not.toBeInTheDocument();

    await user.click(screen.getByText('취소'));

    expect(screen.getByText('#React')).toBeInTheDocument();
    expect(screen.getByText('#TypeScript')).toBeInTheDocument();
  });

  it('이슈 4: 같은 노트를 계속 편집 중인 상태로 취소해도 태그가 롤백된다 (리마운트 없이)', async () => {
    const user = userEvent.setup();
    await renderEditor({ selectedNoteId: '1' });

    const input = await screen.findByLabelText('태그 입력');
    await user.type(input, '임시태그{Enter}');
    await user.click(screen.getByText('취소'));

    // selectedNoteId가 그대로인 상태(리마운트 없음)에서도 롤백이 유지돼야 한다
    expect(screen.queryByText('#임시태그')).not.toBeInTheDocument();
    expect(screen.getByText('#React')).toBeInTheDocument();
    expect(screen.getByText('#TypeScript')).toBeInTheDocument();
  });

  it('이슈 2: 새 노트 작성 중에도 태그를 추가할 수 있고 저장 시 반영된다', async () => {
    const user = userEvent.setup();
    mockedApi.createNote.mockResolvedValue({
      id: '2',
      title: '새 노트',
      content: '',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      tags: ['아이디어'],
    });
    await renderEditor({ isCreating: true, notes: [] });

    const tagInput = await screen.findByLabelText('태그 입력');
    await user.type(tagInput, '아이디어{Enter}');
    await user.type(screen.getByLabelText('제목'), '새 노트');
    await user.click(screen.getByText('저장'));

    await waitFor(() =>
      expect(mockedApi.createNote).toHaveBeenCalledWith(
        expect.objectContaining({ title: '새 노트', tags: ['아이디어'] }),
      ),
    );
  });
});
