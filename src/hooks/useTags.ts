import { useState } from 'react';

export function useTags(initialTags: string[] = []) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const isDuplicate = tags.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (!isDuplicate) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const deleteTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const reset = (nextTags: string[] = []) => {
    setTags(nextTags);
    setTagInput('');
  };

  return { tags, tagInput, setTagInput, addTag, deleteTag, reset };
}
