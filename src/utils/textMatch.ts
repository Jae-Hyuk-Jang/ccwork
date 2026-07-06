export interface MatchRange {
  start: number;
  end: number;
}

export function findMatchRanges(text: string, query: string): MatchRange[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const lowerText = text.toLowerCase();
  const lowerQuery = trimmedQuery.toLowerCase();
  const ranges: MatchRange[] = [];

  let fromIndex = 0;
  while (fromIndex <= lowerText.length) {
    const foundIndex = lowerText.indexOf(lowerQuery, fromIndex);
    if (foundIndex === -1) break;
    ranges.push({ start: foundIndex, end: foundIndex + lowerQuery.length });
    fromIndex = foundIndex + lowerQuery.length;
  }

  return ranges;
}
