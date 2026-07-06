import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { renderHighlighted } from './highlightText';

describe('renderHighlighted', () => {
  it('검색어가 비어있으면 원문을 그대로 반환한다 (하이라이트 없음)', () => {
    const { container } = render(<>{renderHighlighted('React 공부', '')}</>);

    expect(container.textContent).toBe('React 공부');
    expect(container.querySelector('mark')).not.toBeInTheDocument();
  });

  it('일치하는 부분을 <mark>로 감싼다', () => {
    const { container } = render(<>{renderHighlighted('React 공부', 'react')}</>);

    const mark = container.querySelector('mark');
    expect(mark).not.toBeNull();
    expect(mark?.textContent).toBe('React');
    expect(container.textContent).toBe('React 공부');
  });

  it('원문 대소문자를 변형하지 않고 그대로 강조한다', () => {
    const { container } = render(<>{renderHighlighted('오늘 react 공부', 'REACT')}</>);

    const mark = container.querySelector('mark');
    expect(mark?.textContent).toBe('react');
  });

  it('여러 번 일치하면 모두 <mark>로 감싼다', () => {
    const { container } = render(<>{renderHighlighted('react and React again', 'react')}</>);

    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
    expect(marks[0].textContent).toBe('react');
    expect(marks[1].textContent).toBe('React');
  });

  it('하이라이트 요소는 하드코딩 색상이 아니라 디자인 토큰 클래스를 쓴다', () => {
    const { container } = render(<>{renderHighlighted('React 공부', 'react')}</>);

    expect(container.querySelector('mark')?.className).toContain('bg-tertiary-container/40');
  });

  it('일치하는 부분이 없으면 원문을 그대로 반환한다', () => {
    const { container } = render(<>{renderHighlighted('hello world', 'xyz')}</>);

    expect(container.textContent).toBe('hello world');
    expect(container.querySelector('mark')).not.toBeInTheDocument();
  });
});
