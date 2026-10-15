'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Mine, Snapshot } from './data';

const VOTER_KEY = 'smile-vote-voter-id';

function makeId() {
  try {
    return crypto.randomUUID();
  } catch {
    return 'v-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

// 로그인 없이 기기(브라우저)별로 투표를 구분하기 위한 익명 ID. 이름·개인정보는 저장하지 않음.
function getVoterId(): string {
  try {
    let id = localStorage.getItem(VOTER_KEY);
    if (!id) {
      id = makeId();
      localStorage.setItem(VOTER_KEY, id);
    }
    return id;
  } catch {
    return makeId();
  }
}

const EMPTY: Mine = { cfg: null, des: [] };

type Options = { pollMs?: number; withVoter?: boolean };

export function useVotes({ pollMs = 5000, withVoter = true }: Options = {}) {
  const [voterId, setVoterId] = useState<string | null>(null);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [mine, setMine] = useState<Mine>(EMPTY);
  const [history, setHistory] = useState<Mine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const pending = useRef(0);
  const first = useRef(true);

  useEffect(() => {
    setVoterId(withVoter ? getVoterId() : '');
  }, [withVoter]);

  const load = useCallback(async () => {
    if (voterId === null) return;
    try {
      const q = voterId ? `?voter=${encodeURIComponent(voterId)}` : '';
      const res = await fetch(`/api/votes${q}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('load');
      const data: Snapshot = await res.json();
      if (pending.current > 0) return;
      setSnap(data);
      setUpdatedAt(new Date());
      if (first.current) {
        first.current = false;
        setMine(data.mine);
      }
      setError((e) => (e === 'load' ? null : e));
    } catch {
      setError('load');
    }
  }, [voterId]);

  useEffect(() => {
    if (voterId === null) return;
    void load();
    const t = setInterval(load, pollMs);
    const onVis = () => document.visibilityState === 'visible' && void load();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [voterId, pollMs, load]);

  const send = useCallback(
    async (next: Mine, prev: Mine, onFail: () => void) => {
      if (!voterId) return;
      setMine(next);
      pending.current += 1;
      try {
        const res = await fetch('/api/votes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voterId, cfg: next.cfg, des: next.des }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { error?: string }).error || '저장하지 못했어요.');
        setSnap(data as Snapshot);
        setUpdatedAt(new Date());
        setError(null);
      } catch (e) {
        setMine(prev);
        onFail();
        setError(e instanceof Error ? e.message : '저장하지 못했어요.');
      } finally {
        pending.current -= 1;
      }
    },
    [voterId],
  );

  const commit = useCallback(
    (next: Mine) => {
      const prev = mine;
      setHistory((h) => [...h, prev]);
      void send(next, prev, () => setHistory((h) => h.slice(0, -1)));
    },
    [mine, send],
  );

  const undo = useCallback(() => {
    const prev = history[history.length - 1];
    if (!prev) return false;
    setHistory((h) => h.slice(0, -1));
    void send(prev, mine, () => setHistory((h) => [...h, prev]));
    return true;
  }, [history, mine, send]);

  const reset = useCallback(() => {
    if (mine.cfg === null && mine.des.length === 0) return false;
    commit(EMPTY);
    return true;
  }, [mine, commit]);

  return {
    snap,
    mine,
    commit,
    undo,
    reset,
    canUndo: history.length > 0,
    closed: snap?.closed ?? false,
    error,
    updatedAt,
    ready: snap !== null,
  };
}
