'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Drawer, { type Open } from './Drawer';
import ResultsPanel from './ResultsPanel';
import { CONFIGS, DESIGNS, MAX_CONFIG_VOTES, MAX_DESIGN_VOTES, img } from '@/lib/data';
import { useVotes } from '@/lib/useVotes';

type Note = { kind: 'info' | 'warn'; text: string };

export default function VoteApp() {
  const v = useVotes({ pollMs: 5000 });
  const { mine, snap, closed } = v;
  const [open, setOpen] = useState<Open | null>(null);
  const [lastDesign, setLastDesign] = useState(3);
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 5000);
    return () => clearTimeout(t);
  }, [note]);

  const openItem = useCallback((o: Open | null) => {
    setOpen(o);
    if (o?.t === 'd') setLastDesign(o.n);
  }, []);

  const nav = useCallback(
    (dir: 1 | -1) => {
      if (!open) return;
      if (open.t === 'd') openItem({ t: 'd', n: ((open.n - 1 + dir + DESIGNS.length) % DESIGNS.length) + 1 });
      else openItem({ t: 'c', i: (open.i + dir + CONFIGS.length) % CONFIGS.length });
    },
    [open, openItem],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') openItem(null);
      else if (e.key === 'ArrowLeft') nav(-1);
      else if (e.key === 'ArrowRight') nav(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, nav, openItem]);

  const toggleDesign = (n: number) => {
    if (closed) return setNote({ kind: 'warn', text: '투표가 마감됐어요.' });
    if (mine.des.includes(n)) {
      v.commit({ ...mine, des: mine.des.filter((x) => x !== n) });
      setNote({ kind: 'info', text: `시안 ${n} 투표를 취소했어요.` });
    } else if (mine.des.length >= MAX_DESIGN_VOTES) {
      setNote({ kind: 'warn', text: `시안은 ${MAX_DESIGN_VOTES}개까지 투표할 수 있어요. 하나를 취소한 뒤 다시 선택해 주세요.` });
    } else {
      v.commit({ ...mine, des: [...mine.des, n] });
      setNote({ kind: 'info', text: `시안 ${n}에 투표했어요. (${mine.des.length + 1}/${MAX_DESIGN_VOTES})` });
    }
  };

  const chooseConfig = (i: number) => {
    if (closed) return setNote({ kind: 'warn', text: '투표가 마감됐어요.' });
    const c = CONFIGS[i];
    if (mine.cfg === i) {
      v.commit({ ...mine, cfg: null });
      setNote({ kind: 'info', text: `구성 ${c.mark} 투표를 취소했어요.` });
    } else {
      const changed = mine.cfg !== null;
      v.commit({ ...mine, cfg: i });
      setNote({
        kind: 'info',
        text: changed
          ? `구성 투표를 ${c.mark}로 바꿨어요. 구성은 ${MAX_CONFIG_VOTES}개만 투표할 수 있어요.`
          : `구성 ${c.mark}에 투표했어요.`,
      });
    }
  };

  const undo = () => {
    if (closed) return;
    if (v.undo()) setNote({ kind: 'info', text: '직전 투표를 되돌렸어요.' });
  };
  const reset = () => {
    if (closed) return;
    if (v.reset()) setNote({ kind: 'info', text: '내 투표를 모두 초기화했어요.' });
  };

  const done = mine.cfg !== null && mine.des.length === MAX_DESIGN_VOTES;
  let banner: { kind: 'info' | 'warn' | 'ok' | 'danger'; head?: string; text: string };
  if (closed) banner = { kind: 'warn', text: '투표가 마감됐어요. 결과는 아래에서 확인할 수 있어요.' };
  else if (v.error && v.error !== 'load') banner = { kind: 'danger', text: v.error };
  else if (v.error === 'load') banner = { kind: 'warn', text: '결과를 불러오지 못했어요. 자동으로 다시 시도하고 있어요.' };
  else if (note) banner = { kind: note.kind === 'warn' ? 'warn' : 'info', text: note.text };
  else if (done) banner = { kind: 'ok', text: '투표가 모두 끝났어요. 마감 전까지 언제든 취소하고 다시 고를 수 있어요.' };
  else
    banner = {
      kind: 'info',
      head: '투표 안내',
      text: `구성은 ${MAX_CONFIG_VOTES}개만 투표할 수 있어요. 시안은 마음에 드는 ${MAX_DESIGN_VOTES}개를 골라 투표해 주세요. 투표는 익명이고, 취소하고 다시 고를 수 있어요.`,
    };

  const lastDesignForDrawer = open?.t === 'd' ? open.n : lastDesign;

  return (
    <div className={open ? 'shell open' : 'shell'}>
      <main className="main">
        <header className="top">
          <div>
            <p className="eyebrow">LASTBUTTON × SONGTAESEOK</p>
            <h1>스마일 선물세트 패키지 시안 투표</h1>
          </div>
          <div className="actions">
            <button onClick={undo} disabled={!v.canUndo || closed}>되돌리기</button>
            <button onClick={reset} disabled={closed || (mine.cfg === null && mine.des.length === 0)}>내 투표 초기화</button>
            <Link href="/results" className="btn-link">전체 결과</Link>
          </div>
        </header>

        <div className={`banner ${banner.kind}`} role="status" aria-live="polite">
          {banner.head && <b>{banner.head}</b>}
          <span>{banner.text}</span>
        </div>

        <section className="block">
          <div className="block-head">
            <h2>1. 구성 선택 · {MAX_CONFIG_VOTES}개만 투표</h2>
            <span className="count">{mine.cfg === null ? 0 : 1}/{MAX_CONFIG_VOTES} 사용</span>
          </div>
          <p className="sub">누르면 구성 설명과 치수를 볼 수 있어요. 투표는 설명 창에서 해요.</p>
          <div className="cfg-grid">
            {CONFIGS.map((c) => (
              <button
                key={c.id}
                className={`cfg ${mine.cfg === c.id ? 'sel' : ''} ${open?.t === 'c' && open.i === c.id ? 'cur' : ''}`}
                onClick={() => openItem({ t: 'c', i: c.id })}
                aria-label={`구성 ${c.mark} ${c.name}${mine.cfg === c.id ? ', 투표함' : ''}`}
              >
                <b>{c.mark} {c.short}</b>
                <small>{c.size.replace(' × 39.8mm', '')}</small>
                {mine.cfg === c.id && <em>투표함</em>}
              </button>
            ))}
          </div>
        </section>

        <section className="block">
          <div className="block-head">
            <h2>2. 시안 선택 · 마음에 드는 {MAX_DESIGN_VOTES}개 투표</h2>
            <span className="count">{mine.des.length}/{MAX_DESIGN_VOTES} 사용</span>
          </div>
          <p className="sub">카드를 누르면 상세 시안을 볼 수 있어요. 좌우 방향키로 시안을 넘겨볼 수 있어요.</p>
          <div className="card-grid">
            {DESIGNS.map((d) => {
              const mineD = mine.des.includes(d.n);
              return (
                <button
                  key={d.n}
                  className={`card ${mineD ? 'sel' : ''} ${open?.t === 'd' && open.n === d.n ? 'cur' : ''}`}
                  onClick={() => openItem({ t: 'd', n: d.n })}
                  aria-label={`시안 ${d.n}${mineD ? ', 투표함' : ''}`}
                >
                  <img src={img(d.n, 'closed')} alt="" loading={d.n <= 3 ? 'eager' : 'lazy'} />
                  <span className="card-foot">
                    <b>시안 {d.n}</b>
                    <span>
                      {mineD && <em className="check">투표함</em>}
                      <small>{snap ? `${snap.designs[d.n - 1]}표` : ''}</small>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="block">
          <div className="block-head">
            <h2>실시간 결과</h2>
            <Link href="/results" className="more">전체 보기</Link>
          </div>
          <ResultsPanel snap={snap} mine={mine} updatedAt={v.updatedAt} onOpenDesign={(n) => openItem({ t: 'd', n })} />
        </section>

        <footer className="foot">이미지는 3D로 그린 시안이에요. 실제 인쇄 색과 종이 질감은 조금 다를 수 있어요.</footer>
      </main>

      <aside className="drawer" aria-hidden={!open} aria-label="상세 보기">
        {open && (
          <Drawer
            open={open}
            mine={mine}
            closed={closed}
            lastDesign={lastDesignForDrawer}
            onClose={() => openItem(null)}
            onNav={nav}
            onOpen={openItem}
            onToggleDesign={toggleDesign}
            onChooseConfig={chooseConfig}
          />
        )}
      </aside>
      {open && <div className="scrim" onClick={() => openItem(null)} />}
    </div>
  );
}
