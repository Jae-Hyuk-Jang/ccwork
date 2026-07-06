import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTags } from './useTags';

describe('useTags', () => {
  it('이슈 2: 태그를 추가하면 tags에 포함되고 tagInput은 비워진다', () => {
    const { result } = renderHook(() => useTags());

    act(() => {
      result.current.setTagInput('React');
    });
    act(() => {
      result.current.addTag();
    });

    expect(result.current.tags).toEqual(['React']);
    expect(result.current.tagInput).toBe('');
  });

  it('이슈 2: 입력값의 앞뒤 공백은 trim한 뒤 추가된다', () => {
    const { result } = renderHook(() => useTags());

    act(() => {
      result.current.setTagInput('  React  ');
    });
    act(() => {
      result.current.addTag();
    });

    expect(result.current.tags).toEqual(['React']);
  });

  it('이슈 2: 이미 존재하는 태그와 대소문자만 다른 값은 추가되지 않는다', () => {
    const { result } = renderHook(() => useTags(['React']));

    act(() => {
      result.current.setTagInput('react');
    });
    act(() => {
      result.current.addTag();
    });

    expect(result.current.tags).toEqual(['React']);
  });

  it('이슈 2: 공백만 입력한 채 추가하면 아무 것도 추가되지 않는다', () => {
    const { result } = renderHook(() => useTags());

    act(() => {
      result.current.setTagInput('   ');
    });
    act(() => {
      result.current.addTag();
    });

    expect(result.current.tags).toEqual([]);
  });

  it('이슈 3: 태그를 삭제하면 tags에서 제거된다', () => {
    const { result } = renderHook(() => useTags(['React', 'TypeScript']));

    act(() => {
      result.current.deleteTag('React');
    });

    expect(result.current.tags).toEqual(['TypeScript']);
  });

  it('이슈 4: reset을 호출하면 지정한 태그로 되돌아가고 tagInput도 비워진다', () => {
    const { result } = renderHook(() => useTags(['React']));

    act(() => {
      result.current.setTagInput('TypeScript');
    });
    act(() => {
      result.current.addTag();
    });
    expect(result.current.tags).toEqual(['React', 'TypeScript']);

    act(() => {
      result.current.reset(['React']);
    });

    expect(result.current.tags).toEqual(['React']);
    expect(result.current.tagInput).toBe('');
  });
});
