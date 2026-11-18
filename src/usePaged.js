import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

export function usePaged(path, limit = 10) {
  const [items, setItems] = useState([]);
  const [cursors, setCursors] = useState([null]);
  const [nextCursor, setNextCursor] = useState(null);
  const [page, setPage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (stack) => {
      if (!path) return;
      const from = stack[stack.length - 1];
      setLoading(true);
      setError('');
      try {
        const sep = path.includes('?') ? '&' : '?';
        const res = await api(`${path}${sep}limit=${limit}${from ? `&cursor=${from}` : ''}`);
        setItems(res.items);
        setNextCursor(res.nextCursor);
        setPage(res);
        setCursors(stack);
      } catch (e) {
        setError(e.message);
        setItems([]);
        setPage(null);
      } finally {
        setLoading(false);
      }
    },
    [path, limit]
  );

  useEffect(() => {
    load([null]);
  }, [load]);

  return {
    items,
    setItems,
    page,
    error,
    loading,
    pageNo: cursors.length,
    hasPrev: cursors.length > 1,
    hasNext: Boolean(nextCursor),
    next: () => load([...cursors, nextCursor]),
    prev: () => load(cursors.slice(0, -1)),
    reload: () => load([null]),
  };
}
