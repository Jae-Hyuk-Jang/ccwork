import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  it('aria-label="노트 검색"으로 검색창을 찾을 수 있다', () => {
    render(<SearchInput value="" onChange={() => {}} />);

    expect(screen.getByLabelText('노트 검색')).toBeInTheDocument();
  });

  it('입력하면 onChange가 새 값과 함께 호출된다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    await user.type(screen.getByLabelText('노트 검색'), 'react');

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.map((c) => c[0]).join('')).toBe('react');
  });

  it('value가 비어있으면 x 버튼이 보이지 않는다', () => {
    render(<SearchInput value="" onChange={() => {}} />);

    expect(screen.queryByRole('button', { name: '검색어 지우기' })).not.toBeInTheDocument();
  });

  it('value가 있으면 x 버튼이 보이고, 클릭하면 onChange("")가 호출된다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="react" onChange={onChange} />);

    const clearButton = screen.getByRole('button', { name: '검색어 지우기' });
    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
  });
});
