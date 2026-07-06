import { Fragment, ReactNode } from 'react';
import { findMatchRanges } from './textMatch';

export function renderHighlighted(text: string, query: string): ReactNode {
  const ranges = findMatchRanges(text, query);
  if (ranges.length === 0) return text;

  const segments: ReactNode[] = [];
  let cursor = 0;

  ranges.forEach((range, i) => {
    if (range.start > cursor) {
      segments.push(<Fragment key={`text-${i}`}>{text.slice(cursor, range.start)}</Fragment>);
    }
    segments.push(
      <mark key={`mark-${i}`} className="bg-tertiary-container/40">
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  });

  if (cursor < text.length) {
    segments.push(<Fragment key="text-last">{text.slice(cursor)}</Fragment>);
  }

  return segments;
}
