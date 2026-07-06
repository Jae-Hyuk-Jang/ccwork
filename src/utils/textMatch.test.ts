import { describe, it, expect } from 'vitest';
import { findMatchRanges } from './textMatch';

describe('findMatchRanges', () => {
  it('대소문자를 무시하고 부분 문자열이 일치하는 구간을 찾는다', () => {
    expect(findMatchRanges('React 공부', 'react')).toEqual([{ start: 0, end: 5 }]);
  });

  it('검색어의 앞뒤 공백은 trim한 뒤 비교한다', () => {
    expect(findMatchRanges('타입스크립트를 공부', '  타입  ')).toEqual([{ start: 0, end: 2 }]);
  });

  it('일치하는 구간이 없으면 빈 배열을 반환한다', () => {
    expect(findMatchRanges('hello world', 'xyz')).toEqual([]);
  });

  it('빈 문자열 검색어는 즉시 빈 배열을 반환한다 (무한 루프 방지)', () => {
    expect(findMatchRanges('아무 텍스트', '')).toEqual([]);
  });

  it('공백만 있는 검색어는 trim 결과가 빈 문자열이므로 빈 배열을 반환한다', () => {
    expect(findMatchRanges('아무 텍스트', '   ')).toEqual([]);
  });

  it('같은 검색어가 여러 번 등장하면 모든 일치 구간을 반환한다', () => {
    expect(findMatchRanges('react and React again', 'react')).toEqual([
      { start: 0, end: 5 },
      { start: 10, end: 15 },
    ]);
  });

  it('정규식 특수문자를 리터럴 문자열로 취급한다 (에러 없이 매칭)', () => {
    expect(() => findMatchRanges('3.14 계산', '.')).not.toThrow();
    expect(findMatchRanges('3.14 계산', '.')).toEqual([{ start: 1, end: 2 }]);
    expect(findMatchRanges('가(나)다', '(나)')).toEqual([{ start: 1, end: 4 }]);
  });
});
